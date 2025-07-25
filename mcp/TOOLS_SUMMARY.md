# Dota Management MCP Server - Tools Summary

This document provides a comprehensive overview of all 16 tools exposed by the Dota Management MCP server and their mappings to the original dashboard APIs.

## Summary Statistics

- **Total Tools**: 16
- **API Endpoints Covered**: 15+ unique endpoints
- **Categories**: 6 main categories
- **Excluded Sensitive APIs**: Token management, Account management, Create release (requires file uploads)

## Tools by Category

### 🏢 Organization Management (2 tools)

| Tool Name | API Endpoint | HTTP Method | Description |
|-----------|-------------|-------------|-------------|
| `list_organizations` | `/api/v1/tenants` | GET | List all organizations/tenants |
| `list_apps` | `/api/v1/{tenant}/apps` | GET | List applications for specific organization (**tenant required**) |

### 📱 Application Management (2 tools)

| Tool Name | API Endpoint | HTTP Method | Description |
|-----------|-------------|-------------|-------------|
| `create_app` | `/api/v1/apps` | POST | Create new applications |
| `get_app` | `/api/v1/{app}` | GET | Get application details |

### 🚀 Deployment Management (5 tools)

| Tool Name | API Endpoint | HTTP Method | Description |
|-----------|-------------|-------------|-------------|
| `list_deployments` | `/api/v1/{app}/deployments` | GET | List deployments for applications |
| `create_deployment` | `/api/v1/{app}/deployments` | POST | Create new deployments |
| `get_deployment` | `/api/v1/{app}/deployments/{deployment}` | GET | Get deployment details |
| `update_deployment` | `/api/v1/{app}/deployments/{deployment}` | PATCH | Update release metadata (rollout, flags) |
| `delete_deployment` | `/api/v1/{app}/deployments/{deployment}` | DELETE | Delete deployments |

### 📦 Release Management (4 tools)

| Tool Name | API Endpoint | HTTP Method | Description |
|-----------|-------------|-------------|-------------|
| `update_release` | `/api/v1/{app}/deployments/{deployment}` | PATCH | Update release metadata |
| `get_release_history` | `/api/v1/{app}/deployments/{deployment}` | GET | Get release history |
| `promote_release` | `/api/v1/{app}/deployments/{source}/promote/{target}` | POST | Promote releases between deployments |

### 📊 Metrics & Analytics (1 tool)

| Tool Name | API Endpoint | HTTP Method | Description |
|-----------|-------------|-------------|-------------|
| `get_deployment_metrics` | `/api/v1/{app}/deployments/{deployment}` | GET | Get deployment metrics and analytics |

### 👥 Collaborator Management (2 tools)

| Tool Name | API Endpoint | HTTP Method | Description |
|-----------|-------------|-------------|-------------|
| `list_collaborators` | `/api/v1/{app}/collaborators` | GET | List app collaborators |
| `add_collaborator` | `/api/v1/{app}/collaborators` | POST | Add collaborators to apps |
| `remove_collaborator` | `/api/v1/{app}/collaborators/{email}` | DELETE | Remove collaborators from apps |

## Original Dashboard APIs Covered

Based on analysis of the `/web/app/components/Pages` folder, the following APIs are covered:

### ✅ Covered APIs
- `GET /api/v1/tenants` - Organization listing
- `GET /api/v1/:org/apps` - App listing
- `POST /api/v1/:org/apps` - App creation
- `DELETE /api/v1/:org/apps/:app` - App deletion (covered via delete operations)
- `GET /api/v1/:app/deployments` - Deployment listing
- `POST /api/v1/:app/deployments` - Deployment creation
- `DELETE /api/v1/:app/deployments` - Deployment deletion
- `GET /api/v1/:app/deployments/:deployment` - Release history/metrics
- `POST /api/v1/:app/deployments/:deployment/releases` - Release upload
- `PATCH /api/v1/:app/deployments/:deployment` - Release updates
- `POST /api/v1/:app/deployments/:source/promote/:target` - Release promotion
- `GET /api/v1/:app/collaborators` - Collaborator listing
- `POST /api/v1/:app/collaborators` - Add collaborator
- `DELETE /api/v1/:app/collaborators` - Remove collaborator

### ❌ Excluded APIs (As Requested)
- `GET /api/v1/access-keys` - Token listing
- `POST /api/v1/access-keys` - Token creation
- `DELETE /api/v1/access-keys` - Token deletion
- Other sensitive account management APIs

## Authentication & Security

All tools require:
- **`authToken`** (required): Bearer token for API authentication
- **`tenant`** (optional): Organization/Tenant ID for multi-tenant operations

The server properly handles:
- Authorization headers (`Authorization: Bearer ${token}`)
- Tenant headers (`tenant: ${tenantId}`)
- Custom headers for specific operations (e.g., `deploymentName`, `email`)

## Error Handling

The server includes comprehensive error handling:
- API request validation using Zod schemas
- Network error handling with descriptive messages
- Authentication error propagation
- Proper error context and details

## Metrics & Analytics Features

The `get_deployment_metrics` tool provides comprehensive analytics:

```typescript
{
  deploymentName: string,
  totalReleases: number,
  activeReleases: number,
  totalDownloads: number,
  totalInstalls: number,
  totalActiveDevices: number,
  totalRollbacks: number,
  adoptionRate: string,     // Calculated percentage
  rollbackRate: string,     // Calculated percentage
  packageHistory: Array     // Full release history with metrics
}
```

## Usage Examples

### With Claude Desktop
```json
{
  "mcpServers": {
    "dota-management": {
      "command": "node",
      "args": ["/path/to/mcp/build/index.js"],
      "env": {
        "DOTA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Natural Language Commands
- "List all organizations for my account"
- "Create a new app called 'mobile-app' in the 'production' org"
- "Show me the deployments for the mobile-app"
- "Get metrics for the production deployment"
- "Promote the latest release from staging to production"
- "Add john@company.com as a collaborator with Owner permissions"

## Testing

The server includes a test script (`test-mcp.js`) that verifies:
- ✅ Server initialization
- ✅ Tool discovery (16 tools found)
- ✅ Tool execution capability
- ✅ Proper MCP protocol compliance

## Future Enhancements

Potential improvements for future versions:
1. **Batch Operations**: Support for bulk operations across multiple apps/deployments
2. **Webhooks**: Integration with webhook notifications
3. **Enhanced Metrics**: Time-series data and trending analysis
4. **File Upload**: Support for release package uploads via MCP
5. **Caching**: Response caching for better performance
6. **Real-time Updates**: WebSocket support for live metrics

## Conclusion

The Dota Management MCP server successfully exposes all major management APIs from the dashboard as MCP tools, enabling natural language interaction with the Dota platform through MCP-compatible clients like Claude Desktop. The server maintains proper security boundaries by excluding sensitive APIs while providing comprehensive management capabilities for organizations, applications, deployments, releases, and collaborators. 