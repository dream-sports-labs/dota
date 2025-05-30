// seed.ts — Seed tables + history blobs for Azurite local emulator

import {
  TableClient,
  TableServiceClient,
  AzureNamedKeyCredential,
} from "@azure/data-tables";
import { BlobServiceClient } from "@azure/storage-blob";

const CONNECTION_STRING = "UseDevelopmentStorage=true";

const tableServiceClient = TableServiceClient.fromConnectionString(CONNECTION_STRING);
const blobServiceClient  = BlobServiceClient.fromConnectionString(CONNECTION_STRING);

const seedData = {
  storagev2: [
    { partitionKey: "schema", rowKey: "version", value: "2" },
    {
      partitionKey: "deploymentKey O25dwjupnmTCC-q70qC1CzWfO73NkSR75brivk",
      rowKey:       "",
      appId:        "id_2",
      deploymentId: "id_5",
    },
    {
      partitionKey: "deploymentKey deployment_key_2",
      rowKey:       "",
      appId:        "id_3",
      deploymentId: "id_6",
    },
    {
      partitionKey: "accessKey mock-google-token",
      rowKey:       "",
      accountId:    "id_0",
      expires:      (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
    },
    {
      partitionKey: "accountId id_0",
      rowKey:       "accountId* id_0",
      partitionKeyPointer: "email default@example.com",
      rowKeyPointer:       "",
    },
    {
      partitionKey: "email default@example.com",
      rowKey:       "",
      partitionKeyPointer: "accountId id_0",
      rowKeyPointer:       "accountId* id_0",
    },
  ],

  accounts: [
    {
      partitionKey: "accountId id_0",
      rowKey:       "accountId* id_0",
      id:           "id_0",
      name:         "Default User",
      email:        "default@example.com",
    },
    {
      partitionKey:        "email default@example.com",
      rowKey:              "",
      partitionKeyPointer: "accountId id_0",
      rowKeyPointer:       "accountId* id_0",
    },
    {
      partitionKey: "Account",
      rowKey:       "id_0",
      email:        "user1@example.com",
      name:         "User One",
      createdTime:  Date.now().toString(),
    },
    {
      partitionKey: "Account",
      rowKey:       "id_1",
      email:        "user2@example.com",
      name:         "User Two",
      createdTime:  Date.now().toString(),
    },
  ],

  tenants: [
    {
      partitionKey: "Tenant",
      rowKey:       "tenant_1",
      displayName:  "organization-one",
      createdBy:    "id_0",
    },
    {
      partitionKey: "Tenant",
      rowKey:       "tenant_2",
      displayName:  "organization-two",
      createdBy:    "id_1",
    },
    {
      partitionKey: "Tenant",
      rowKey:       "tenant_3",
      displayName:  "org-hyphenated",
      createdBy:    "id_0",
    },
  ],

  apps: [
    {
      partitionKey: "App",
      rowKey:       "id_2",
      name:         "app-one",
      accountId:    "id_0",
      tenantId:     "tenant_1",
      createdTime:  Date.now().toString(),
    },
    {
      partitionKey: "App",
      rowKey:       "id_3",
      name:         "app-two",
      accountId:    "id_1",
      tenantId:     "tenant_2",
      createdTime:  Date.now().toString(),
    },
    {
      partitionKey: "App",
      rowKey:       "id_4",
      name:         "independent-app",
      accountId:    "id_0",
      createdTime:  Date.now().toString(),
    },
    {
      partitionKey: "App",
      rowKey:       "id_5",
      name:         "hyphenated-app",
      accountId:    "id_0",
      tenantId:     "tenant_3",
      createdTime:  Date.now().toString(),
    },
  ],

  collaborators: [
    {
      partitionKey: "Collaborator",
      rowKey:       "id_2:user1@example.com",
      email:        "user1@example.com",
      accountId:    "id_0",
      appId:        "id_2",
      permission:   "Owner",
      role:         "Admin",
    },
    {
      partitionKey: "Collaborator",
      rowKey:       "id_3:user2@example.com",
      email:        "user2@example.com",
      accountId:    "id_1",
      appId:        "id_3",
      permission:   "Owner",
      role:         "Admin",
    },
    {
      partitionKey: "Collaborator",
      rowKey:       "id_5:user1@example.com",
      email:        "user1@example.com",
      accountId:    "id_0",
      appId:        "id_5",
      permission:   "Owner",
      role:         "Admin",
    },
  ],

  deployments: [
    {
      partitionKey: "Deployment",
      rowKey:       "id_5",
      name:         "Deployment One",
      key:          "O25dwjupnmTCC-q70qC1CzWfO73NkSR75brivk",
      appId:        "id_2",
      packageId:    "pkg_1",
      createdTime:  "1731269070",
    },
    {
      partitionKey: "Deployment",
      rowKey:       "id_6",
      name:         "Deployment for App Two",
      key:          "deployment_key_2",
      appId:        "id_3",
      packageId:    "pkg_current_2",
      createdTime:  "1731269070",
    },
    {
      partitionKey: "Deployment",
      rowKey:       "id_7",
      name:         "main-deployment",
      key:          "deployment_key_hyphenated",
      appId:        "id_5",
      packageId:    "pkg_hyphenated_1",
      createdTime:  "1731269070",
    },
  ],

  packages: [
    {
      partitionKey: "Package",
      rowKey:       "pkg_1",
      appVersion:   "1.0.0",
      blobUrl:
        "https://codepush-secondary.blob.core.windows.net/storagev2/z98_ktyhgijjKQai7fIvDj6z_t6pb984637d-14f4-409d-9646-13a0665a3902",
      description:  "Minor improvements",
      isDisabled:   "false",
      isMandatory:  "false",
      label:        "v1",
      manifestBlobUrl:
        "https://codepush-secondary.blob.core.windows.net/storagev2",
      packageHash:
        "d581c94fa2c00b144f1b9a5cf786787826bdf4a9e12e4941c8d2541efc7518ed",
      releasedBy:   "user1@example.com",
      releaseMethod:"Upload",
      size:         "256994",
      uploadTime:   "1731269070",
      deploymentId: "id_5",
      rollout:      "100",
    },
    {
      partitionKey: "Package",
      rowKey:       "pkg_current_1",
      appVersion:   "1.0.0",
      blobUrl:      "https://example.com/blob_v1",
      description:  "Current version of App One",
      isDisabled:   "false",
      isMandatory:  "true",
      label:        "v2",
      manifestBlobUrl:"https://example.com/manifest_v1",
      packageHash:  "hash_1",
      releasedBy:   "user1@example.com",
      releaseMethod:"Upload",
      size:         "1024",
      uploadTime:   Date.now().toString(),
      deploymentId: "id_5",
      rollout:      "100",
    },
    {
      partitionKey: "Package",
      rowKey:       "pkg_current_2",
      appVersion:   "1.2.0",
      blobUrl:      "https://example.com/blob_v2",
      description:  "Current version of App Two",
      isDisabled:   "false",
      isMandatory:  "false",
      label:        "v2",
      manifestBlobUrl:"https://example.com/manifest_v2",
      packageHash:  "hash_2",
      releasedBy:   "user2@example.com",
      releaseMethod:"Upload",
      size:         "2048",
      uploadTime:   Date.now().toString(),
      deploymentId: "id_6",
      rollout:      "100",
    },
    {
      partitionKey: "Package",
      rowKey:       "pkg_hist_1",
      appVersion:   "1.2.3",
      blobUrl:      "https://example.com/blob_v0.9",
      description:  "Previous version of App One",
      isDisabled:   "false",
      isMandatory:  "false",
      label:        "v3",
      manifestBlobUrl:"https://example.com/manifest_v0.9",
      packageHash:  "hash_old_1",
      releasedBy:   "user1@example.com",
      releaseMethod:"Upload",
      size:         "900",
      uploadTime:   (Date.now() - 1_000_000).toString(),
      deploymentId: "id_5",
      rollout:      "100",
    },
    {
      partitionKey: "Package",
      rowKey:       "pkg_hyphenated_1",
      appVersion:   "1.0.0",
      blobUrl:      "https://example.com/blob_hyphenated",
      description:  "Initial release for hyphenated app",
      isDisabled:   "false",
      isMandatory:  "false",
      label:        "v1",
      manifestBlobUrl: "https://example.com/manifest_hyphenated",
      packageHash:  "hash_hyphenated_1",
      releasedBy:   "user1@example.com",
      releaseMethod:"Upload",
      size:         "1234",
      uploadTime:   "1731269070",
      deploymentId: "id_7",
      rollout:      "100",
    },
    {
      partitionKey: "Package",
      rowKey:       "pkg_hyphenated_2",
      appVersion:   "1.0.1",
      blobUrl:      "https://example.com/blob_hyphenated_v2",
      description:  "Second release for hyphenated app",
      isDisabled:   "false",
      isMandatory:  "false",
      label:        "v2",
      manifestBlobUrl: "https://example.com/manifest_hyphenated_v2",
      packageHash:  "hash_hyphenated_2",
      releasedBy:   "user1@example.com",
      releaseMethod:"Upload",
      size:         "2345",
      uploadTime:   "1731269080",
      deploymentId: "id_7",
      rollout:      "100",
    },
    {
      partitionKey: "Package",
      rowKey:       "pkg_hyphenated_3",
      appVersion:   "1.0.2",
      blobUrl:      "https://example.com/blob_hyphenated_v3",
      description:  "Third release for hyphenated app",
      isDisabled:   "false",
      isMandatory:  "false",
      label:        "v3",
      manifestBlobUrl: "https://example.com/manifest_hyphenated_v3",
      packageHash:  "hash_hyphenated_3",
      releasedBy:   "user1@example.com",
      releaseMethod:"Upload",
      size:         "3456",
      uploadTime:   "1731269090",
      deploymentId: "id_7",
      rollout:      "100",
    },
  ],

  accessKeys: [
    {
      partitionKey: "AccessKey",
      rowKey:       "id_6",
      name:         "accessKey1",
      accountId:    "id_0",
      createdBy:    "admin",
      createdTime:  Date.now().toString(),
      friendlyName: "Default Access Key",
      expires:      "1735689600000",
      scope:        "all",
    },
    {
      partitionKey: "AccessKey",
      rowKey:       "mock_token_key",
      name:         "mock-google-token",
      accountId:    "id_0",
      createdBy:    "admin",
      createdTime:  Date.now().toString(),
      friendlyName: "Mock Google Token for Development",
      expires:      (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
      scope:        "all",
    },
  ],

  accessKeyNameToAccountIdMap: [
    {
      partitionKey: "accessKey accessKey1",
      rowKey:       "",
      accountId:    "id_0",
      expires:      (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
    },
    {
      partitionKey: "accessKey mock-google-token",
      rowKey:       "",
      accountId:    "id_0",
      expires:      (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
    },
  ],
};

async function seedTable(name: string, entities: any[]) {
  try { await tableServiceClient.deleteTable(name); } catch {}
  await tableServiceClient.createTable(name);
  const client = TableClient.fromConnectionString(CONNECTION_STRING, name);
  for (const e of entities) {
    try { await client.createEntity(e); }
    catch (err: any) { if (err.code !== "EntityAlreadyExists") console.error(err); }
  }
}

async function seedHistoryBlobs() {
  const container = blobServiceClient.getContainerClient("packagehistoryv1");
  await container.createIfNotExists();
  for (const pkg of seedData.packages) {
    const history = seedData.packages
      .filter(p => p.deploymentId === pkg.deploymentId)
      .map(p => ({
        appVersion:      p.appVersion,
        label:           p.label,
        packageHash:     p.packageHash,
        rollout:         Number(p.rollout),
        isMandatory:     p.isMandatory === "true",
        blobUrl:         p.blobUrl,
        manifestBlobUrl: p.manifestBlobUrl,
        size:            Number(p.size),
        description:     p.description,
        releasedBy:      p.releasedBy,
        releaseMethod:   p.releaseMethod,
        uploadTime:      Number(p.uploadTime),
      }));
    await container
      .getBlockBlobClient(pkg.deploymentId)
      .upload(JSON.stringify(history), Buffer.byteLength(JSON.stringify(history)));
  }
}

async function main() {
  const tables = Object.keys(seedData) as Array<keyof typeof seedData>;
  for (const t of tables) {
    if (t === "storagev2") continue;
    await seedTable(t, seedData[t]);
  }
  await seedTable("storagev2", seedData.storagev2);
  await seedHistoryBlobs();
}

main().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
