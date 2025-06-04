import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosResponse } from "axios";

// Base API URL - can be configured via environment variable
const API_BASE_URL = process.env.DOTA_API_URL || "http://localhost:3000";

// Helper function to make API requests with proper error handling
async function makeApiRequest<T>(config: {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
}): Promise<T> {
  try {
    const response = await axios({
      method: config.method,
      url: `${API_BASE_URL}${config.url}`,
      data: config.data,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'API request failed';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      if (data && typeof data === 'object') {
        if (Array.isArray(data.message)) {
          // Handle validation errors with array of messages
          const messages = data.message.map((msg: any) => `${msg.field}: ${msg.message}`).join(', ');
          errorMessage = `API Error (${status}): ${messages}`;
        } else if (data.message) {
          errorMessage = `API Error (${status}): ${data.message}`;
        } else if (data.error) {
          errorMessage = `API Error (${status}): ${data.error}`;
        } else {
          errorMessage = `API Error (${status}): ${JSON.stringify(data)}`;
        }
      } else {
        errorMessage = `API Error (${status}): ${data || 'Unknown error'}`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = `Network Error: Could not connect to API at ${API_BASE_URL}${config.url}`;
    } else {
      // Other error
      errorMessage = `Request Error: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
}

// Create server instance
const server = new McpServer({
  name: "dota-management",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

// =============================================================================
// ORGANIZATION MANAGEMENT TOOLS
// =============================================================================

server.tool(
  "list_apps",
  {
    authToken: z.string().describe("Authentication token"),
    tenant: z.string().describe("Tenant/Organization ID (required)"),
  },
  async ({ authToken, tenant }) => {
    // Require tenant to be provided, same as CLI requiring org context
    if (!tenant) {
      throw new Error("Organization/tenant ID is required. Please specify a tenant parameter to list apps for that organization.");
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
      'tenant': tenant,
    };

    // Use the apps endpoint for the specific organization
    const data = await makeApiRequest<any>({
      method: 'GET',
      url: `/api/v1/${tenant}/apps`,
      headers,
    });

    return {
      content: [
        {
          type: "text",
          text: `Applications for organization '${tenant}':\n${JSON.stringify(data.apps, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "create_app",
  {
    authToken: z.string().describe("Authentication token"),
    name: z.string().describe("Application name"),
    orgId: z.string().optional().describe("Organization ID (optional)"),
    orgName: z.string().optional().describe("Organization name (optional)"),
    displayName: z.string().optional().describe("Display name (optional)"),
  },
  async ({ authToken, name, orgId, orgName, displayName }) => {
    const data = await makeApiRequest<any>({
      method: 'POST',
      url: `/api/v1/${orgId?.length ? orgId : 'new'}/apps`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      data: {
        name,
        orgId,
        orgName,
        displayName,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Application created successfully:\n${JSON.stringify(data.app, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "get_app",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'GET',
      url: `/api/v1/${tenant || 'default'}/apps`,
      headers,
    });

    const app = data.apps?.find((a: any) => a.name === appName);
    if (!app) {
      throw new Error(`Application '${appName}' not found`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Application details:\n${JSON.stringify(app, null, 2)}`,
        },
      ],
    };
  }
);

// =============================================================================
// DEPLOYMENT MANAGEMENT TOOLS
// =============================================================================

server.tool(
  "list_deployments",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'GET',
      url: `/api/v1/${appName}/deployments`,
      headers,
    });

    return {
      content: [
        {
          type: "text",
          text: `Deployments for ${appName}:\n${JSON.stringify(data.deployments, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "create_deployment",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    name: z.string().describe("Deployment name"),
    key: z.string().optional().describe("Deployment key (optional, auto-generated if not provided)"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, name, key, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'POST',
      url: `/api/v1/${appName}/deployments`,
      headers,
      data: {
        name,
        key,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Deployment created successfully:\n${JSON.stringify(data.deployments, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "get_deployment",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    deploymentName: z.string().describe("Deployment name"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, deploymentName, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'GET',
      url: `/api/v1/${appName}/deployments/${deploymentName}`,
      headers,
    });

    return {
      content: [
        {
          type: "text",
          text: `Deployment details:\n${JSON.stringify(data.deployment, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "update_deployment",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    deploymentName: z.string().describe("Deployment name"),
    label: z.string().describe("Release label to update"),
    rollout: z.number().min(0).max(100).describe("Rollout percentage (0-100, required - must be >= current value)"),
    isDisabled: z.boolean().optional().describe("Whether the release is disabled (optional)"),
    isMandatory: z.boolean().optional().describe("Whether the release is mandatory (optional)"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, deploymentName, label, rollout, isDisabled, isMandatory, tenant }) => {
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      };
      if (tenant) headers['tenant'] = tenant;

      const updateData: any = { 
        label,
        rollout, // Always required by the API
      };
      if (isDisabled !== undefined) updateData.isDisabled = isDisabled;
      if (isMandatory !== undefined) updateData.isMandatory = isMandatory;

      // Use direct axios call instead of makeApiRequest wrapper
      const response = await axios({
        method: 'PATCH',
        url: `${API_BASE_URL}/api/v1/${appName}/deployments/${deploymentName}`,
        data: updateData,
        headers,
      });

      return {
        content: [
          {
            type: "text",
            text: `Release '${label}' in deployment '${deploymentName}' updated successfully:\n${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      let errorMessage = 'Update deployment failed';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (data && typeof data === 'object') {
          if (Array.isArray(data.message)) {
            const messages = data.message.map((msg: any) => `${msg.field}: ${msg.message}`).join(', ');
            errorMessage = `API Error (${status}): ${messages}`;
          } else if (data.message) {
            errorMessage = `API Error (${status}): ${data.message}`;
          } else {
            errorMessage = `API Error (${status}): ${JSON.stringify(data)}`;
          }
        } else {
          errorMessage = `API Error (${status}): ${data || 'Unknown error'}`;
        }
      } else if (error.request) {
        errorMessage = `Network Error: Could not connect to API`;
      } else {
        errorMessage = `Request Error: ${error.message}`;
      }
      
      return {
        content: [
          {
            type: "text",
            text: errorMessage,
          },
        ],
      };
    }
  }
);

server.tool(
  "delete_deployment",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    deploymentName: z.string().describe("Deployment name"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, deploymentName, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
      'deploymentName': deploymentName,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'DELETE',
      url: `/api/v1/${appName}/deployments`,
      headers,
    });

    return {
      content: [
        {
          type: "text",
          text: `Deployment '${deploymentName}' deleted successfully:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }
);

// =============================================================================
// RELEASE MANAGEMENT TOOLS
// =============================================================================

server.tool(
  "update_release",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    deploymentName: z.string().describe("Deployment name"),
    label: z.string().describe("Release label"),
    appVersion: z.string().optional().describe("App version (optional)"),
    description: z.string().optional().describe("Release description (optional)"),
    isDisabled: z.boolean().optional().describe("Whether the release is disabled (optional)"),
    isMandatory: z.boolean().optional().describe("Whether the release is mandatory (optional)"),
    rollout: z.number().min(0).max(100).optional().describe("Rollout percentage (0-100, optional)"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, deploymentName, label, appVersion, description, isDisabled, isMandatory, rollout, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const updateData: any = { label };
    if (appVersion !== undefined) updateData.appVersion = appVersion;
    if (description !== undefined) updateData.description = description;
    if (isDisabled !== undefined) updateData.isDisabled = isDisabled;
    if (isMandatory !== undefined) updateData.isMandatory = isMandatory;
    if (rollout !== undefined) updateData.rollout = rollout;

    const data = await makeApiRequest<any>({
      method: 'PATCH',
      url: `/api/v1/${appName}/deployments/${deploymentName}`,
      headers,
      data: updateData,
    });

    return {
      content: [
        {
          type: "text",
          text: `Release updated successfully:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "get_release_history",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    deploymentName: z.string().describe("Deployment name"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, deploymentName, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'GET',
      url: `/api/v1/${appName}/deployments/${deploymentName}`,
      headers,
    });

    const packageHistory = data.deployment?.packageHistory || [];
    
    return {
      content: [
        {
          type: "text",
          text: `Release history for ${deploymentName}:\n${JSON.stringify(packageHistory, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "promote_release",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    sourceDeployment: z.string().describe("Source deployment name"),
    targetDeployment: z.string().describe("Target deployment name"),
    label: z.string().optional().describe("Release label to promote (optional)"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, sourceDeployment, targetDeployment, label, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'POST',
      url: `/api/v1/${appName}/deployments/${sourceDeployment}/promote/${targetDeployment}`,
      headers,
      data: {
        appId: appName,
        sourceDeployment,
        targetDeployment,
        label,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Release promoted from '${sourceDeployment}' to '${targetDeployment}':\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }
);

// =============================================================================
// METRICS AND ANALYTICS TOOLS
// =============================================================================

server.tool(
  "get_deployment_metrics",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    deploymentName: z.string().describe("Deployment name"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, deploymentName, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'GET',
      url: `/api/v1/${appName}/deployments/${deploymentName}`,
      headers,
    });

    const deployment = data.deployment;
    const packageHistory = deployment?.packageHistory || [];
    
    // Calculate metrics
    const totalReleases = packageHistory.length;
    const activeReleases = packageHistory.filter((r: any) => !r.isDisabled).length;
    const totalDownloads = packageHistory.reduce((sum: number, r: any) => sum + (r.downloaded || 0), 0);
    const totalInstalls = packageHistory.reduce((sum: number, r: any) => sum + (r.installed || 0), 0);
    const totalActiveDevices = packageHistory.reduce((sum: number, r: any) => sum + (r.active || 0), 0);
    const totalRollbacks = packageHistory.reduce((sum: number, r: any) => sum + (r.failed || 0), 0);

    const metrics = {
      deploymentName,
      totalReleases,
      activeReleases,
      totalDownloads,
      totalInstalls,
      totalActiveDevices,
      totalRollbacks,
      adoptionRate: totalActiveDevices > 0 ? ((totalInstalls / totalActiveDevices) * 100).toFixed(2) + '%' : '0%',
      rollbackRate: totalInstalls > 0 ? ((totalRollbacks / totalInstalls) * 100).toFixed(2) + '%' : '0%',
      packageHistory,
    };

    return {
      content: [
        {
          type: "text",
          text: `Deployment metrics for '${deploymentName}':\n${JSON.stringify(metrics, null, 2)}`,
        },
      ],
    };
  }
);

// =============================================================================
// ORGANIZATION/TENANT TOOLS
// =============================================================================

server.tool(
  "list_organizations",
  {
    authToken: z.string().describe("Authentication token"),
  },
  async ({ authToken }) => {
    const data = await makeApiRequest<any>({
      method: 'GET',
      url: '/api/v1/tenants',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Organizations:\n${JSON.stringify(data.organisations, null, 2)}`,
        },
      ],
    };
  }
);

// =============================================================================
// COLLABORATOR MANAGEMENT TOOLS
// =============================================================================

server.tool(
  "list_collaborators",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'GET',
      url: `/api/v1/${appName}/collaborators`,
      headers,
    });

    return {
      content: [
        {
          type: "text",
          text: `Collaborators for ${appName}:\n${JSON.stringify(data.collaborators, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "add_collaborator",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    email: z.string().describe("Collaborator email"),
    permission: z.enum(["Owner", "Collaborator"]).describe("Permission level (Owner, Collaborator)"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, email, permission, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'POST',
      url: `/api/v1/${appName}/collaborators`,
      headers,
      data: {
        email,
        permission,
      },
    });

    return {
      content: [
        {
          type: "text",
          text: `Collaborator '${email}' added with '${permission}' permission:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "remove_collaborator",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    email: z.string().describe("Collaborator email"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, email, tenant }) => {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${authToken}`,
      'email': email,
    };
    if (tenant) headers['tenant'] = tenant;

    const data = await makeApiRequest<any>({
      method: 'DELETE',
      url: `/api/v1/${appName}/collaborators`,
      headers,
    });

    return {
      content: [
        {
          type: "text",
          text: `Collaborator '${email}' removed successfully:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "release_update_guide",
  {
    authToken: z.string().describe("Authentication token"),
    appName: z.string().describe("Application name"),
    deploymentName: z.string().describe("Deployment name"),
    appVersion: z.string().describe("App version to release"),
    packagePath: z.string().optional().describe("Path to package files (for CLI reference)"),
    description: z.string().optional().describe("Release description"),
    tenant: z.string().optional().describe("Tenant/Organization ID (optional)"),
  },
  async ({ authToken, appName, deploymentName, appVersion, packagePath, description, tenant }) => {
    const cliCommand = `dota release ${appName} ${packagePath || './your-app-files'} ${appVersion} -d ${deploymentName}${description ? ` --des "${description}"` : ''}`;
    
    return {
      content: [
        {
          type: "text",
          text: `# 📦 Release Update Guide

## ❌ Why MCP Cannot Release Updates

The Dota release API requires **actual file uploads** which MCP cannot handle:

\`\`\`typescript
// From management.ts - requires file uploads
const file = getFileWithField(req, "package");
if (!file || !file.buffer) {
  // Requires actual file buffer
}
\`\`\`

## ✅ How to Release Updates

### 1. Use Dota CLI for File Upload
\`\`\`bash
# Install Dota CLI if not already installed
npm install -g dota-cli

# Release your update with files
${cliCommand}
\`\`\`

### 2. Then Use MCP for Management
After releasing via CLI, you can use MCP tools to manage the release:

\`\`\`bash
# Check the release
get_deployment("${appName}", "${deploymentName}")

# Update rollout percentage
update_deployment("${appName}", "${deploymentName}", "v${appVersion}", 50, false, false)

# Promote to other deployments  
promote_release("${appName}", "${deploymentName}", "Production", "v${appVersion}")
\`\`\`

## 📋 Your Release Parameters
- **App**: ${appName}
- **Deployment**: ${deploymentName} 
- **Version**: ${appVersion}
- **Package**: ${packagePath || './your-app-files'}
- **Description**: ${description || 'Update release'}
- **Organization**: ${tenant || 'default'}

## 🔄 Complete Workflow
1. **Prepare files** in ${packagePath || './your-app-files'}
2. **Run CLI command** above to upload & release
3. **Use MCP tools** to manage rollout and promotion
4. **Monitor with MCP** using get_deployment_metrics

## 💡 Pro Tips
- Start with low rollout (e.g., 10%) in CLI: \`--rollout 10\`
- Use MCP to gradually increase rollout
- Promote successful releases to production via MCP`,
        },
      ],
    };
  }
);

// Running the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dota Management MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 