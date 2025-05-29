export default function CLICommands() {
  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">
        <span>Docs</span>
        <span className="mx-2">/</span>
        <span>CLI</span>
        <span className="mx-2">/</span>
        <span>CLI Usage Guide</span>
      </div>

      <div className="flex flex-col">
        <div className="w-full">
          <h1 className="text-4xl font-bold mb-6">CLI Usage Guide</h1>

          <div className="mb-8">
            <p className="mb-4">
              This section contains a comprehensive reference for all DOTA CLI commands, including
              their exact usage and examples. The general usage format is:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>dota &lt;command-category&gt; &lt;command&gt; [options]</code>
            </pre>
            <p>
              Some commands also allow specifying <code>&lt;ownerName&gt;/&lt;appName&gt;</code> 
              when working within an organization context. Below you'll find each command category 
              with specific usage details.
            </p>
          </div>
          <div className="alert-note mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="alert-icon"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="alert-content">
                    <strong>Note:</strong>
                    <p>
                    Organization names should not contain spaces. Use camelCase or hyphens for multi-word organization names (e.g., "MyOrg" or "my-org").
                    </p>
              </div>
          </div>

          {/* -------------------------------------------------------------
              APP MANAGEMENT
          ------------------------------------------------------------- */}
          <div className="mb-8" id="app-management">
            <h2 className="text-2xl font-bold mb-4">App Management</h2>

            <p className="mb-4">
              Before you can deploy any updates, you need to register an app with the DOTA service
              using the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota app add <ownerName>/<appName>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota app add OrgName/MyApp`}
              </code>
            </pre>

            <p className="mb-4">
              If your app targets both iOS and Android, please create separate apps for each
              platform with DOTA. For example:
            </p>
            <pre className="code-block mb-6">
              <code>{`  dota app add OrgName/MyApp-Android
  dota app add OrgName/MyApp-iOS`}</code>
            </pre>

            <div className="alert-note mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="alert-icon"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="alert-content">
                <strong>Note:</strong>
                <p>
                  Using the same app for iOS and Android may cause installation exceptions because
                  the DOTA update package produced for iOS will have different content from the
                  update produced for Android.
                </p>
              </div>
            </div>

            <p className="mb-4">
              All new apps automatically come with two deployments (Staging and Production).
              After you create an app, the CLI will output the deployment keys for these default 
              deployments, which you can begin using to configure your mobile clients with the React 
              Native SDK.
            </p>

            <p className="mb-4">
              If you decide that you don't like the name you gave to an app, you can rename it at
              any time using the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota app rename <currentAppName> <newAppName>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota app rename MyOldAppName MyNewAppName`}
              </code>
            </pre>

            <p className="mb-4">
              If at some point you no longer need an app, you can remove it from the server using
              the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota app remove <ownerName>/<appName>
  dota app rm <ownerName>/<appName>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota app rm OrgName/MyApp
  dota app remove OrgName/SomeOtherApp`}
              </code>
            </pre>

            <div className="alert-warning mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="alert-icon"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div className="alert-content">
                <strong>Caution:</strong>
                <p>
                  Do this with caution since any apps configured to use it will stop receiving 
                  updates.
                </p>
              </div>
            </div>

            <p className="mb-4">
              Finally, if you want to list all apps that you've registered with the DOTA server,
              you can run the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`   dota app list [options]
   dota app ls [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`# List all apps (default: table format)
  dota app ls

# List all apps in JSON format
  dota app ls --format json

# List all apps for a specific org
  dota app list --org <orgName>
  dota app ls --org <orgName> --format json`}
              </code>
            </pre>
            <p className="mb-4">
              The table output shows the following columns:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Name</strong> - The name of the app</li>
              <li><strong>Deployments</strong> - The list of deployments associated with the app</li>
            </ul>
          </div>

          {/* -------------------------------------------------------------
              ORGANIZATION MANAGEMENT
          ------------------------------------------------------------- */}
          <div className="mb-8" id="organization-management">
            <h2 className="text-2xl font-bold mb-4">Organization Management</h2>

            <p className="mb-4">
              Commands for managing organizations in DOTA.
            </p>

            <p className="mb-4">
              To list all organizations associated with your account:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota org list [options]
  dota org ls [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota org ls
  dota org ls --format json`}
              </code>
            </pre>
          </div>

          {/* -------------------------------------------------------------
              COLLABORATOR MANAGEMENT
          ------------------------------------------------------------- */}
          <div className="mb-8" id="collaborator-management">
            <h2 className="text-2xl font-bold mb-4">Collaborator Management</h2>

            <p className="mb-4">
              DOTA allows you to add collaborators to your app, enabling other developers to deploy
              updates to your app's deployments.
            </p>
            <p className="mb-4">To add a new collaborator to your app:</p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota collaborator add <ownerName>/<appName> <email>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota collaborator add OrgName/MyApp foo@bar.com`}
              </code>
            </pre>

            <p className="mb-4">To remove a collaborator from your app:</p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota collaborator remove <ownerName>/<appName> <email>
  dota collaborator rm <ownerName>/<appName> <email>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota collaborator rm OrgName/MyApp foo@bar.com`}
              </code>
            </pre>

            <p className="mb-4">To list all collaborators for your app:</p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota collaborator list <ownerName>/<appName> [options]
  dota collaborator ls <ownerName>/<appName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota collaborator ls OrgName/MyApp
  dota collaborator ls OrgName/MyApp --format json`}
              </code>
            </pre>
          </div>

          {/* -------------------------------------------------------------
              ACCESS KEY MANAGEMENT
          ------------------------------------------------------------- */}
          <div className="mb-8" id="access-key-management">
            <h2 className="text-2xl font-bold mb-4">Access Key Management</h2>

            <p className="mb-4">
              Access keys enable you to authenticate with the DOTA service without needing to use 
              your GitHub or Microsoft credentials.
            </p>
            <p className="mb-4">To create a new access key:</p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key add <accessKeyName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key add "VSTS Integration"
  dota access-key add "One time key" --ttl 5m`}
              </code>
            </pre>

            <p className="mb-4">To update an existing access key:</p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key patch <accessKeyName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key patch "Key for build server" --name "Key for CI machine"
  dota access-key patch "Key for build server" --ttl 7d`}
              </code>
            </pre>

            <p className="mb-4">To remove an access key:</p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key remove <accessKeyName>
  dota access-key rm <accessKeyName>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key rm "VSTS Integration"`}
              </code>
            </pre>

            <p className="mb-4">To list all access keys:</p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key list [options]
  dota access-key ls [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota access-key ls
  dota access-key ls --format json`}
              </code>
            </pre>
          </div>

          {/* -------------------------------------------------------------
              DEPLOYMENT MANAGEMENT
          ------------------------------------------------------------- */}
          <div className="mb-8" id="deployment-management">
            <h2 className="text-2xl font-bold mb-4">Deployment Management</h2>

            <p className="mb-4">
              From the DOTA perspective, an app is simply a named grouping for one or more
              "deployments." While the app represents a conceptual "namespace," its deployments 
              represent the actual targets for releasing updates (for developers) and synchronizing 
              updates (for end-users).
            </p>

            <div className="alert-note mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="alert-icon"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="alert-content">
                <strong>Note:</strong>
                <p>
                  The release, promote and rollback commands require both an app name and a 
                  deployment name in order to work, because it is the combination of the two 
                  that uniquely identifies a point of distribution (e.g., "I want to release 
                  an update of my iOS app to my beta testers.").
                </p>
              </div>
            </div>

            <p className="mb-4">
              Whenever an app is registered with the DOTA service, it includes two deployments by
              default: Staging and Production. If having just staging and production is enough to
              meet your needs, you don't need to do anything else. However, if you want an alpha,
              dev, etc. deployment, you can easily create them using the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment add <ownerName>/<appName> <deploymentName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment add OrgName/MyApp MyDeployment
  dota deployment add OrgName/MyApp MyDeployment -k abc123`}
              </code>
            </pre>

            <p className="mb-4">
              Just like with apps, you can remove and rename deployments as well, using the
              following commands respectively:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment remove <ownerName>/<appName> <deploymentName>
  dota deployment rm <ownerName>/<appName> <deploymentName>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment rm OrgName/MyApp MyDeployment`}
              </code>
            </pre>

            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment rename <ownerName>/<appName> <currentDeploymentName> <newDeploymentName>`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment rename OrgName/MyApp MyDeployment NewDeploymentName`}
              </code>
            </pre>

            <p className="mb-4">
              If at any time you'd like to view the list of deployments that a specific app
              includes, you can simply run the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment list <ownerName>/<appName> [options]
  dota deployment ls <ownerName>/<appName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment ls OrgName/MyApp
  dota deployment ls OrgName/MyApp --format json
  dota deployment ls OrgName/MyApp --displayKeys`}
              </code>
            </pre>

            <p className="mb-4 text-center font-bold">Deployment list</p>

            <div className="alert-note mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="alert-icon"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="alert-content">
                <strong>Note:</strong>
                <p>
                  Deployment keys aren't displayed by default. If you need to view them, simply make
                  sure to pass the <code>-k</code> (or <code>--displayKeys</code>) flag to the 
                  <code>dota deployment ls</code> command.
                </p>
              </div>
            </div>

            <p className="mb-4">
              This will display not only the list of deployments, but also the update metadata 
              and installation metrics for their latest release.
            </p>

            <p className="mb-4">The install metrics have the following meaning:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>Active</strong> - The number of successful installs that are currently
                running this release.
              </li>
              <li>
                <strong>Total</strong> - The total number of successful installations that this
                update has received overall.
              </li>
              <li>
                <strong>Pending</strong> - The number of times this release has been downloaded, but
                not yet installed.
              </li>
              <li>
                <strong>Rollbacks</strong> - The number of times that this release has been
                automatically rolled back on the client.
              </li>
              <li>
                <strong>Rollout</strong> - Indicates the percentage of users that are eligible to
                receive this update.
              </li>
              <li>
                <strong>Disabled</strong> - Indicates whether the release has been marked as
                disabled or not.
              </li>
            </ul>
          </div>

          {/* -------------------------------------------------------------
              RELEASING UPDATES
          ------------------------------------------------------------- */}
          <div className="mb-8" id="releasing-updates">
            <h2 className="text-2xl font-bold mb-4">Releasing Updates</h2>

            <p className="mb-4">
              Once your app has been configured to query for updates against the DOTA server, you 
              can begin releasing updates. The DOTA CLI includes two different commands for 
              releasing updates:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <strong>General</strong> (<code>dota release</code>) - Releases an update to the 
                DOTA server that was generated by an external tool or build script.
              </li>
              <li>
                <strong>React Native</strong> (<code>dota release-react</code>) - Performs the same 
                functionality as <code>dota release</code>, but also handles generating the updated 
                app contents for you (JS bundle and assets).
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Releasing Updates (General)</h3>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota release <ownerName>/<appName> <updateContentsPath> <targetBinaryVersion> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  # Release a single file to the Staging deployment (default)
  dota release OrgName/MyApp app.js "*"

  # Release a folder to the Production deployment
  dota release OrgName/MyApp ./platforms/ios/www 1.0.3 -d Production

  # Release a folder to Production with a rollout to 20% of users
  dota release OrgName/MyApp ./platforms/ios/www 1.0.3 -d Production -r 20`}
              </code>
            </pre>
            <p className="mb-4">
              <b>Options:</b>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>-d, --deploymentName</strong>: Deployment to release the update to (default: Staging). The deployment name should be a single value without any additional suffixes.</li>
              <li><strong>-des, --description</strong>: Description of the changes made to the app in this release. This will be displayed in the release history.</li>
              <li><strong>-x, --disabled</strong>: If set, the update will not be immediately downloadable by users.</li>
              <li><strong>-m, --mandatory</strong>: If set, the update is considered mandatory and users will be prompted to install it.</li>
              <li><strong>--noDuplicateReleaseError</strong>: If set, uploading an identical update will produce a warning instead of an error.</li>
              <li><strong>-r, --rollout</strong>: The percentage of users that should receive this release (defaults to 100%). Can be specified as a number (e.g., 20) or percentage (e.g., 20%).</li>
            </ul>
            <p className="mb-4">
              <b>Notes:</b>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The <code>updateContentsPath</code> should point to a directory or file containing your update content. Do not package it in a .zip or binary file.</li>
              <li>The <code>targetBinaryVersion</code> can be specified as a semver expression (e.g., 1.0.0) or use "*" to target all versions.</li>
              <li>The release process will automatically handle the upload and distribution of your update to the specified deployment.</li>
              <li>You can monitor the release progress through the upload progress indicator.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Releasing Updates (React Native)</h3>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota release-react <ownerName>/<appName> <platform> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`  # Release iOS project to Staging (default)
  dota release-react OrgName/MyApp ios

  # Release Android project to Production
  dota release-react OrgName/MyApp android -d Production

  # Release Windows project in development mode
  dota release-react OrgName/MyApp windows --dev`}
              </code>
            </pre>
            <p className="mb-4">
              <b>Options:</b>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>-b, --bundleName</strong>: Name of the generated JS bundle file</li>
              <li><strong>-d, --deploymentName</strong>: Deployment to release the update to (default: Staging)</li>
              <li><strong>-des, --description</strong>: Description of the changes made to the app with this release</li>
              <li><strong>--dev, --development</strong>: Specifies whether to generate a dev or release build</li>
              <li><strong>-x, --disabled</strong>: If set, the update will not be immediately downloadable</li>
              <li><strong>-e, --entryFile</strong>: Path to the app's entry Javascript file</li>
              <li><strong>-g, --gradleFile</strong>: Path to the gradle file (Android only)</li>
              <li><strong>-m, --mandatory</strong>: If set, the update is considered mandatory</li>
              <li><strong>--noDuplicateReleaseError</strong>: If set, uploading an identical update will produce a warning instead of an error</li>
              <li><strong>-p, --plistFile</strong>: Path to the plist file (iOS only)</li>
              <li><strong>-pre, --plistFilePrefix</strong>: Prefix for Info.plist file (iOS only)</li>
              <li><strong>-r, --rollout</strong>: The percentage of users that should receive this release (defaults to 100%)</li>
              <li><strong>-s, --sourcemapOutput</strong>: Path to where the sourcemap should be written</li>
              <li><strong>-t, --targetBinaryVersion</strong>: Semver expression for the binary app version(s) this release is targeting</li>
              <li><strong>-o, --outputDir</strong>: Path to where the bundle and sourcemap should be written</li>
              <li><strong>-h, --useHermes</strong>: Enable Hermes and bypass automatic checks</li>
              <li><strong>--pod, --podFile</strong>: Path to the cocopods config file (iOS only)</li>
              <li><strong>-hf, --extraHermesFlags</strong>: Flags for Hermes (can be specified multiple times)</li>
              <li><strong>-k, --privateKeyPath</strong>: Path to private key used for code signing</li>
              <li><strong>-xp, --xcodeProjectFile</strong>: Path to the Xcode project or project.pbxproj file</li>
              <li><strong>-xt, --xcodeTargetName</strong>: Name of target (iOS only)</li>
              <li><strong>-c, --buildConfigurationName</strong>: Name of build configuration (iOS only)</li>
            </ul>
          </div>

          {/* -------------------------------------------------------------
              PATCHING UPDATE METADATA
          ------------------------------------------------------------- */}
          <div className="mb-8" id="patching-update-metadata">
            <h2 className="text-2xl font-bold mb-4">Patching Update Metadata</h2>

            <p className="mb-4">
              After releasing an update, there may be scenarios where you need to modify one or more
              of the metadata attributes (e.g. marking an update as mandatory, changing the rollout
              percentage). Use the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota patch <ownerName>/<appName> <deploymentName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`# Mark the latest production release as mandatory
  dota patch OrgName/MyApp Production --mandatory

# Increase the rollout for release label v23 to 50%
  dota patch OrgName/MyApp Production -l v23 --rollout 50`}
              </code>
            </pre>
          </div>

          {/* -------------------------------------------------------------
              PROMOTING UPDATES
          ------------------------------------------------------------- */}
          <div className="mb-8" id="promoting-updates">
            <h2 className="text-2xl font-bold mb-4">Promoting Updates</h2>

            <p className="mb-4">
              Once you've tested an update in a specific deployment (e.g. Staging), and you want to
              promote it "downstream" (e.g. Production), you can copy the release with:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota promote <ownerName>/<appName> <sourceDeploymentName> <destDeploymentName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota promote OrgName/MyApp Staging Production -r 25`}
              </code>
            </pre>
            <p className="mb-4">
              This command creates a new release for the destination deployment with the same code 
              and metadata from the source deployment's latest release, unless you override certain 
              properties (like <code>--description</code>, <code>--rollout</code>, etc.).
            </p>
          </div>

          {/* -------------------------------------------------------------
              ROLLING BACK UPDATES
          ------------------------------------------------------------- */}
          <div className="mb-8" id="rolling-back-updates">
            <h2 className="text-2xl font-bold mb-4">Rolling Back Updates</h2>

            <p className="mb-4">
              If you release an update that is broken or contains unintended features, it's easy to
              roll it back using:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota rollback <ownerName>/<appName> <deploymentName> [options]`}
              </code>
            </pre>
            <p className="mb-2">Examples:</p>
            <pre className="code-block mb-6">
              <code>
{`# Rollback the latest release on Production
  dota rollback OrgName/MyApp Production

# Rollback to a specific release label
  dota rollback OrgName/MyApp Production --targetRelease v34`}
              </code>
            </pre>
          </div>

          {/* -------------------------------------------------------------
              VIEWING RELEASE HISTORY
          ------------------------------------------------------------- */}
          <div className="mb-8" id="viewing-release-history">
            <h2 className="text-2xl font-bold mb-4">Viewing Release History</h2>

            <p className="mb-4">
              You can view a history of the 50 most recent releases for a specific app deployment
              using:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>
{`  dota deployment history <ownerName>/<appName> <deploymentName> [options]
  dota deployment h <ownerName>/<appName> <deploymentName> [options]`}
              </code>
            </pre>
          </div>

          {/* -------------------------------------------------------------
              METRICS
          ------------------------------------------------------------- */}
          <div className="mb-8" id="metrics">
            <h2 className="text-2xl font-bold mb-4">Metrics</h2>
            <p className="mb-4">
              View installation and adoption metrics for a specific release of your app using the following command:
            </p>
            <p className="mb-2">Usage:</p>
            <pre className="code-block mb-6">
              <code>{`  dota metrics <org>/<app> <deployment> <label> <targetVersion>`}</code>
            </pre>
            <p className="mb-2">Example:</p>
            <pre className="code-block mb-6">
              <code>{`  dota metrics organization-one/app-one "Deployment One" v1 1.0.0`}</code>
            </pre>
            <p className="mb-4">This will output:</p>
            <pre className="code-block mb-6">
              <code>{`Metrics for organization-one/app-one [Deployment One] label: v1, target version: 1.0.0
  Rollout:   100%
  Adoption:  0.00% (0 of 0 installs)
  Rollbacks: 0.00% (0 of 0 installs)`}</code>
            </pre>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Rollout</strong> - The percentage of users this release is available to.</li>
              <li><strong>Adoption</strong> - The percentage and count of successful installs out of downloads.</li>
              <li><strong>Rollbacks</strong> - The percentage and count of rollbacks out of installs.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}