

import * as diffErrorUtils from "./diff-error-handling";
import * as env from "../environment";
import * as fs from "fs";
import * as hashUtils from "../utils/hash-utils";
import * as path from "path";
import * as security from "../utils/security";
import * as semver from "semver";
import * as storageTypes from "../storage/storage";
import * as stream from "stream";
import * as streamifier from "streamifier";
import * as superagent from "superagent";
import * as yazl from "yazl";
import * as yauzl from "yauzl";
import PackageManifest = hashUtils.PackageManifest;
import request = require("superagent");

interface IArchiveDiff {
  deletedFiles: string[];
  newOrUpdatedEntries: Map<string, string>; // K = name, V = hash
}

interface DiffBlobInfo {
  packageHash: string;
  blobInfo: storageTypes.BlobInfo;
}

export class PackageDiffer {
  private static MANIFEST_FILE_NAME: string = "hotcodepush.json";
  private static WORK_DIRECTORY_PATH: string = env.getTempDirectory();
  private static IS_WORK_DIRECTORY_CREATED: boolean = false;

  private _storage: storageTypes.Storage;
  private _maxPackagesToDiff: number;

  constructor(storage: storageTypes.Storage, maxPackagesToDiff?: number) {
    this._maxPackagesToDiff = maxPackagesToDiff || 1;
    this._storage = storage;
  }

  public generateDiffPackageMap(
    accountId: string,
    appId: string,
    deploymentId: string,
    newPackage: storageTypes.Package
  ): Promise<storageTypes.PackageHashToBlobInfoMap> {
    if (!newPackage || !newPackage.blobUrl || !newPackage.manifestBlobUrl) {
      return Promise.reject<storageTypes.PackageHashToBlobInfoMap>(
        diffErrorUtils.diffError(diffErrorUtils.ErrorCode.InvalidArguments, "Package information missing")
      );
    }

    const manifestPromise: Promise<PackageManifest> = this.getManifest(newPackage);
    const historyPromise: Promise<storageTypes.Package[]> = this._storage.getPackageHistory(accountId, appId, deploymentId);
    const newReleaseFilePromise: Promise<string> = this.downloadArchiveFromUrl(newPackage.blobUrl);
    let newFilePath: string;

    return Promise
      .all<any>([manifestPromise, historyPromise, newReleaseFilePromise])
      .then(([newManifest,history,downloadedArchiveFile]:[PackageManifest,storageTypes.Package[],string]) => {
        newFilePath = downloadedArchiveFile;
        const packagesToDiff: storageTypes.Package[] = this.getPackagesToDiff(
          history,
          newPackage.appVersion,
          newPackage.packageHash,
          newPackage.label
        );
        const diffBlobInfoPromises: Promise<DiffBlobInfo>[] = [];
        if (packagesToDiff) {
          packagesToDiff.forEach((appPackage: storageTypes.Package) => {
            diffBlobInfoPromises.push(
              this.uploadAndGetDiffBlobInfo(accountId, appPackage, newPackage.packageHash, newManifest, newFilePath)
            );
          });
        }

        return Promise.all(diffBlobInfoPromises);
      })
      .then((diffBlobInfoList: DiffBlobInfo[]) => {
        // all done, delete the downloaded archive file.
        fs.unlinkSync(newFilePath);

        if (diffBlobInfoList && diffBlobInfoList.length) {
          let diffPackageMap: storageTypes.PackageHashToBlobInfoMap = null;
          diffBlobInfoList.forEach((diffBlobInfo: DiffBlobInfo) => {
            if (diffBlobInfo && diffBlobInfo.blobInfo) {
              diffPackageMap = diffPackageMap || {};
              diffPackageMap[diffBlobInfo.packageHash] = diffBlobInfo.blobInfo;
            }
          });

          return diffPackageMap;
        } else {
          return Promise.resolve(<storageTypes.PackageHashToBlobInfoMap>(null));
        }
      })
      .catch(diffErrorUtils.diffErrorHandler);
  }

  public generateDiffArchive(oldManifest: PackageManifest, newManifest: PackageManifest, newArchiveFilePath: string): Promise<string> {
    return new Promise<string>(
      (resolve: (value?: string | Promise<string>) => void, reject: (reason: any) => void): void => {
        if (!oldManifest || !newManifest) {
          resolve(null);
          return;
        }

        const diff: IArchiveDiff = PackageDiffer.generateDiff(oldManifest.toMap(), newManifest.toMap());

        if (diff.deletedFiles.length === 0 && diff.newOrUpdatedEntries.size === 0) {
          resolve(null);
          return;
        }

        PackageDiffer.ensureWorkDirectoryExists();

        const diffFilePath = path.join(PackageDiffer.WORK_DIRECTORY_PATH, "diff_" + PackageDiffer.randomString(20) + ".zip");
        const writeStream: stream.Writable = fs.createWriteStream(diffFilePath);
        const diffFile = new yazl.ZipFile();

        diffFile.outputStream.pipe(writeStream).on("close", (): void => {
          // This will be called after diffFile.end() is called and all content is written
          resolve(diffFilePath);
        });

        const json: string = JSON.stringify({ deletedFiles: diff.deletedFiles });
        const readStream: stream.Readable = streamifier.createReadStream(json);
        diffFile.addReadStream(readStream, PackageDiffer.MANIFEST_FILE_NAME);

        if (diff.newOrUpdatedEntries.size > 0) {
          yauzl.open(newArchiveFilePath, (error?: any, zipFile?: yauzl.ZipFile): void => {
            if (error) {
              reject(error);
              return;
            }

            // Using an array to track entries we need to add
            const entriesToAdd = Array.from(diff.newOrUpdatedEntries.keys());
            const entriesAdded = new Set<string>();
            
            // Process all entries and add what's needed
            const pendingEntries = new Set<string>();
            
            // Function to check if we've added all entries
            const checkAllEntriesAdded = () => {
              if (entriesAdded.size === entriesToAdd.length && pendingEntries.size === 0) {
                diffFile.end();
              }
            };
            
            zipFile.on("error", (error: any): void => {
              reject(error);
            });
            
            zipFile.on("entry", (entry: yauzl.Entry): void => {
              // Check if we should include this entry
              if (!entriesToAdd.includes(entry.fileName)) {
                return;
              }
              
              // Handle directory entries
              if (/\/$/.test(entry.fileName)) {
                diffFile.addEmptyDirectory(entry.fileName);
                entriesAdded.add(entry.fileName);
                checkAllEntriesAdded();
                return;
              }
              
              // Add the entry to pending set while we process it
              pendingEntries.add(entry.fileName);
              
              zipFile.openReadStream(entry, (error?: any, readStream?: stream.Readable): void => {
                if (error) {
                  pendingEntries.delete(entry.fileName);
                  reject(error);
                  return;
                }
                
                readStream.on("error", (error: any): void => {
                  pendingEntries.delete(entry.fileName);
                  reject(error);
                });
                
                // Add the entry to the diff file
                diffFile.addReadStream(readStream, entry.fileName, {
                  compress: true
                });
                
                // Mark this entry as added when the stream ends
                readStream.on("end", () => {
                  entriesAdded.add(entry.fileName);
                  pendingEntries.delete(entry.fileName);
                  checkAllEntriesAdded();
                });
              });
            });
            
            // When all zip entries have been processed, check if we've added all required entries
            zipFile.on("end", () => {
              // If no pending entries left, end the diff file
              if (pendingEntries.size === 0) {
                checkAllEntriesAdded();
              }
            });
          });
        } else {
          diffFile.end();
        }
      }
    );
  }

  private uploadDiffArchiveBlob(blobId: string, diffArchiveFilePath: string): Promise<storageTypes.BlobInfo> {
    return new Promise<storageTypes.BlobInfo>(
      (
        resolve: (value?: storageTypes.BlobInfo | Promise<storageTypes.BlobInfo>) => void,
        reject: (reason: any) => void      ): void => {
        fs.stat(diffArchiveFilePath, (err: NodeJS.ErrnoException, stats: fs.Stats): void => {
          if (err) {
            reject(err);
            return;
          }

          const readable: fs.ReadStream = fs.createReadStream(diffArchiveFilePath);

          this._storage
            .addBlob(blobId, readable, stats.size)
            .then((blobId: string): Promise<string> => {
              return this._storage.getBlobUrl(blobId);
            })
            .then((blobUrl: string): void => {
              fs.unlink(diffArchiveFilePath, (error) => {
                if (error) {
                  console.error("Error occurred while unlinking file:", error);
                }
              });

              const diffBlobInfo: storageTypes.BlobInfo = { size: stats.size, url: blobUrl };

              resolve(diffBlobInfo);
            })
            .catch((): void => {
              resolve(null);
            })
        });
      }
    );
  }

  private uploadAndGetDiffBlobInfo(
    accountId: string,
    appPackage: storageTypes.Package,
    newPackageHash: string,
    newManifest: PackageManifest,
    newFilePath: string
  ): Promise<DiffBlobInfo> {
    if (!appPackage || appPackage.packageHash === newPackageHash) {
      // If the packageHash matches, no need to calculate diff, its the same package.
      return Promise.resolve(<DiffBlobInfo>(null));
    }

    return this.getManifest(appPackage)
      .then((existingManifest?: PackageManifest) => {
        return this.generateDiffArchive(existingManifest, newManifest, newFilePath);
      })
      .then((diffArchiveFilePath?: string): Promise<storageTypes.BlobInfo> => {
        if (diffArchiveFilePath) {
          return this.uploadDiffArchiveBlob(security.generateSecureKey(accountId), diffArchiveFilePath);
        }

        return Promise.resolve(<storageTypes.BlobInfo>null);
      })
      .then((blobInfo: storageTypes.BlobInfo) => {
        if (blobInfo) {
          return { packageHash: appPackage.packageHash, blobInfo: blobInfo };
        } else {
          return Promise.resolve(<DiffBlobInfo>(null));
        }
      });
  }

  private getManifest(appPackage: storageTypes.Package): Promise<PackageManifest> {
    return new Promise<PackageManifest>(
      (resolve: (manifest: PackageManifest) => void, _reject: (error: any) => void): void => {
        if (!appPackage || !appPackage.manifestBlobUrl) {
          resolve(null);
          return;
        }

        const req: superagent.Request = superagent.get(appPackage.manifestBlobUrl);
        const writeStream = new stream.Writable();
        let json = "";

        writeStream._write = (data: string | Buffer, encoding: string, callback: Function): void => {
          json += (<Buffer>data).toString("utf8");
          callback();
        };

        req.pipe(writeStream).on("finish", () => {
          const manifest: PackageManifest = PackageManifest.deserialize(json);

          resolve(manifest);
        });
      }
    );
  }

  private downloadArchiveFromUrl(url: string): Promise<string> {
    return new Promise<string>(
      (resolve: (value?: string | Promise<string>) => void): void => {
        PackageDiffer.ensureWorkDirectoryExists();

        const downloadedArchiveFilePath = path.join(
          PackageDiffer.WORK_DIRECTORY_PATH,
          "temp_" + PackageDiffer.randomString(20) + ".zip"
        );
        const writeStream: stream.Writable = fs.createWriteStream(downloadedArchiveFilePath);
        const req: request.Request = request.get(url);

        req.pipe(writeStream).on("finish", () => {
          resolve(downloadedArchiveFilePath);
        });
      }
    );
  }

  private getPackagesToDiff(
    history: storageTypes.Package[],
    appVersion: string,
    newPackageHash: string,
    newPackageLabel: string
  ): storageTypes.Package[] {
    if (!history || !history.length) {
      return null;
    }

    // We assume that the new package has been released and already is in history.
    // Only pick the packages that are released before the new package to generate diffs.
    let foundNewPackageInHistory: boolean = false;
    const validPackages: storageTypes.Package[] = [];
    for (let i = history.length - 1; i >= 0; i--) {
      if (!foundNewPackageInHistory) {
        foundNewPackageInHistory = history[i].label === newPackageLabel;
        continue;
      }

      if (validPackages.length === this._maxPackagesToDiff) {
        break;
      }

      const isMatchingAppVersion: boolean = PackageDiffer.isMatchingAppVersion(appVersion, history[i].appVersion);
      if (isMatchingAppVersion && history[i].packageHash !== newPackageHash) {
        validPackages.push(history[i]);
      }
    }

    // maintain the order of release.
    return validPackages.reverse();
  }

  private static generateDiff(oldFileHashes: Map<string, string>, newFileHashes: Map<string, string>): IArchiveDiff {
    const diff: IArchiveDiff = { deletedFiles: [], newOrUpdatedEntries: new Map<string, string>() };

    newFileHashes.forEach((hash: string, name: string): void => {
      if (!PackageDiffer.isEntryInMap(name, hash, oldFileHashes, /*requireContentMatch*/ true)) {
        diff.newOrUpdatedEntries.set(name, hash);
      }
    });

    oldFileHashes.forEach((hash: string, name: string): void => {
      if (!PackageDiffer.isEntryInMap(name, hash, newFileHashes, /*requireContentMatch*/ false)) {
        diff.deletedFiles.push(name);
      }
    });

    return diff;
  }

  private static isMatchingAppVersion(baseAppVersion: string, newAppVersion: string): boolean {
    let isMatchingAppVersion: boolean = false;
    if (!semver.valid(baseAppVersion)) {
      // baseAppVersion is a semver range
      if (!semver.valid(newAppVersion)) {
        // newAppVersion is a semver range
        isMatchingAppVersion = semver.validRange(newAppVersion) === semver.validRange(baseAppVersion);
      } else {
        // newAppVersion is not a semver range
        isMatchingAppVersion = semver.satisfies(newAppVersion, baseAppVersion);
      }
    } else {
      // baseAppVersion is not a semver range
      isMatchingAppVersion = semver.satisfies(baseAppVersion, newAppVersion);
    }

    return isMatchingAppVersion;
  }

  private static ensureWorkDirectoryExists(): void {
    if (!PackageDiffer.IS_WORK_DIRECTORY_CREATED) {
      if (!fs.existsSync(PackageDiffer.WORK_DIRECTORY_PATH)) {
        fs.mkdirSync(PackageDiffer.WORK_DIRECTORY_PATH);
      }

      // Memoize this check to avoid unnecessary file system access.
      PackageDiffer.IS_WORK_DIRECTORY_CREATED = true;
    }
  }

  private static isEntryInMap(name: string, hash: string, map: Map<string, string>, requireContentMatch?: boolean): boolean {
    const hashInMap: string = map.get(name);
    return requireContentMatch ? hashInMap === hash : !!hashInMap;
  }

  private static randomString(length: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let str = "";
    for (let i = 0; i < length; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }

    return str;
  }
}
