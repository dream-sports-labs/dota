import { Sequelize } from "sequelize";
import { createModelss } from "./aws-storage";

// Define the Sequelize connection
const sequelize = new Sequelize("codepushdb", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

// Seed data
export const seedData = {
  accounts: [
    { id: "id_0", email: "user1@example.com", name: "User One", createdTime: new Date().getTime() },
    { id: "id_1", email: "user2@example.com", name: "User Two", createdTime: new Date().getTime() },
  ],
  tenants: [
    { id: "tenant_1", displayName: "organization-one", createdBy: "id_0" },
    { id: "tenant_2", displayName: "organization-two", createdBy: "id_1" },
    { id: "tenant_3", displayName: "org-hyphenated", createdBy: "id_0" },
  ],
  apps: [
    { id: "id_2", name: "app-one", accountId: "id_0", tenantId: "tenant_1", createdTime: new Date().getTime() },
    { id: "id_3", name: "app-two", accountId: "id_1", tenantId: "tenant_2", createdTime: new Date().getTime() },
    { id: "id_4", name: "independent-app", accountId: "id_0", createdTime: new Date().getTime() }, // App without a tenant association
    { id: "id_5", name: "hyphenated-app", accountId: "id_0", tenantId: "tenant_3", createdTime: new Date().getTime() },
  ],
  collaborators: [
    { email: "user1@example.com", accountId: "id_0", appId: "id_2", permission: "Owner", role: "Admin" },
    { email: "user2@example.com", accountId: "id_1", appId: "id_3", permission: "Owner", role: "Admin" },
    { email: "user1@example.com", accountId: "id_0", appId: "id_5", permission: "Owner", role: "Admin" },
  ],
  deployments: [
    {
      id: "id_5",
      name: "Deployment One",
      key: "O25dwjupnmTCC-q70qC1CzWfO73NkSR75brivk",
      appId: "id_2",
      packageId: "pkg_1", // Link deployment to package
      createdTime: 1731269070,
    },
    {
      id: "id_6",
      name: "Deployment for App Two",
      key: "deployment_key_2",
      appId: "id_3",
      packageId: "pkg_current_2", // Link to the current package
      createdTime: 1731269070,
    },
    {
      id: "id_7",
      name: "main-deployment",
      key: "deployment_key_hyphenated",
      appId: "id_5",
      packageId: "pkg_hyphenated_1",
      createdTime: 1731269070,
    },
  ],
  packages: [
    {
      id: "pkg_1",  // Assign a UUID or specific ID here
      appVersion: "1.0.0",
      blobUrl: "https://codepush-secondary.blob.core.windows.net/storagev2/z98_ktyhgijjKQai7fIvDj6z_t6pb984637d-14f4-409d-9646-13a0665a3902",
      description: "Minor improvements",
      isDisabled: false,
      isMandatory: false,
      label: "v1",
      manifestBlobUrl: "https://codepush-secondary.blob.core.windows.net/storagev2",
      packageHash: "d581c94fa2c00b144f1b9a5cf786787826bdf4a9e12e4941c8d2541efc7518ed",
      releasedBy: "user1@example.com",
      releaseMethod: "Upload",
      size: 256994,
      uploadTime: 1731269070,
      deploymentId: "id_5",
      rollout: 100,
    },
    {
      id: "pkg_current_1",
      appVersion: "1.0.0",
      blobUrl: "https://example.com/blob_v1",
      description: "Current version of App One",
      isDisabled: false,
      isMandatory: true,
      label: "v2",
      manifestBlobUrl: "https://example.com/manifest_v1",
      packageHash: "hash_1",
      releasedBy: "user1@example.com",
      releaseMethod: "Upload",
      size: 1024,
      uploadTime: new Date().getTime(),
      deploymentId: "id_5", // Links to the current deployment
      rollout: 100,
    },
    {
      id: "pkg_current_2",
      appVersion: "1.2.0",
      blobUrl: "https://example.com/blob_v2",
      description: "Current version of App Two",
      isDisabled: false,
      isMandatory: false,
      label: "v2",
      manifestBlobUrl: "https://example.com/manifest_v2",
      packageHash: "hash_2",
      releasedBy: "user2@example.com",
      releaseMethod: "Upload",
      size: 2048,
      uploadTime: new Date().getTime(),
      deploymentId: "id_6", // Links to the current deployment
      rollout: 100,
    },
    {
      id: "pkg_hist_1",
      appVersion: "1.2.3",
      blobUrl: "https://example.com/blob_v0.9",
      description: "Previous version of App One",
      isDisabled: false,
      isMandatory: false,
      label: "v3",
      manifestBlobUrl: "https://example.com/manifest_v0.9",
      packageHash: "hash_old_1",
      releasedBy: "user1@example.com",
      releaseMethod: "Upload",
      size: 900,
      uploadTime: new Date().getTime() - 1000000,
      deploymentId: "id_5",
      rollout: 100,
    },
    {
      id: "pkg_hyphenated_1",
      appVersion: "1.0.0",
      blobUrl: "https://example.com/blob_hyphenated",
      description: "Initial release for hyphenated app",
      isDisabled: false,
      isMandatory: false,
      label: "v1",
      manifestBlobUrl: "https://example.com/manifest_hyphenated",
      packageHash: "hash_hyphenated_1",
      releasedBy: "user1@example.com",
      releaseMethod: "Upload",
      size: 1234,
      uploadTime: 1731269070,
      deploymentId: "id_7",
      rollout: 100,
    },
    {
      id: "pkg_hyphenated_2",
      appVersion: "1.0.1",
      blobUrl: "https://example.com/blob_hyphenated_v2",
      description: "Second release for hyphenated app",
      isDisabled: false,
      isMandatory: false,
      label: "v2",
      manifestBlobUrl: "https://example.com/manifest_hyphenated_v2",
      packageHash: "hash_hyphenated_2",
      releasedBy: "user1@example.com",
      releaseMethod: "Upload",
      size: 2345,
      uploadTime: 1731269080,
      deploymentId: "id_7",
      rollout: 100,
    },
    {
      id: "pkg_hyphenated_3",
      appVersion: "1.0.2",
      blobUrl: "https://example.com/blob_hyphenated_v3",
      description: "Third release for hyphenated app",
      isDisabled: false,
      isMandatory: false,
      label: "v3",
      manifestBlobUrl: "https://example.com/manifest_hyphenated_v3",
      packageHash: "hash_hyphenated_3",
      releasedBy: "user1@example.com",
      releaseMethod: "Upload",
      size: 3456,
      uploadTime: 1731269090,
      deploymentId: "id_7",
      rollout: 100,
    },
  ],
  accessKeys: [
    {
      id: "id_6",
      name: "accessKey1",
      accountId: "id_0",
      createdBy: "admin",
      createdTime: new Date().getTime(),
      friendlyName: "Default Access Key",
      expires: 1735689600000,
      scope: "all",
    },
    {
      id: "mock_token_key",
      name: "mock-google-token",
      accountId: "id_0",
      createdBy: "admin",
      createdTime: new Date().getTime(),
      friendlyName: "Mock Google Token for Development",
      expires: Date.now() + (365 * 24 * 60 * 60 * 1000), // One year from now
      scope: "all",
      isSession: true
    }
  ],
};

// Seed function
async function seed() {
  try {
    // Initialize models
    const models = createModelss(sequelize);
    // Sync database
    await sequelize.sync({ alter: true }); // Alters tables without dropping them

    // Insert seed data with upsert operations to avoid duplicate key errors
    console.log("Seeding accounts...");
    for (const account of seedData.accounts) {
      await models.Account.upsert(account);
    }

    console.log("Seeding tenants...");
    for (const tenant of seedData.tenants) {
      await models.Tenant.upsert(tenant);
    }

    console.log("Seeding apps...");
    for (const app of seedData.apps) {
      await models.App.upsert(app);
    }

    console.log("Seeding collaborators...");
    // For collaborators, we'll delete existing ones first (since they have composite keys)
    await models.Collaborator.destroy({
      where: {
        appId: seedData.apps.map(app => app.id)
      }
    });
    await models.Collaborator.bulkCreate(seedData.collaborators);

    console.log("Seeding deployments...");
    for (const deployment of seedData.deployments) {
      await models.Deployment.upsert({
        ...deployment,
        packageId: null // Temporarily set to null to break circular dependency
      });
    }

    console.log("Seeding packages...");
    for (const pkg of seedData.packages) {
      await models.Package.upsert(pkg);
    }

    console.log("Updating deployment package references...");
    // Update the package references for deployments
    for (const deployment of seedData.deployments) {
      if (deployment.packageId) {
        await models.Deployment.update(
          { packageId: deployment.packageId },
          { where: { id: deployment.id } }
        );
      }
    }

    console.log("Seeding access keys...");
    for (const accessKey of seedData.accessKeys) {
      await models.AccessKey.upsert(accessKey);
    }

    console.log("Seed data has been inserted successfully.");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
seed();
