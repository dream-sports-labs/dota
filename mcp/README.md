# Dota Management MCP Server

A comprehensive Model Context Protocol (MCP) server that exposes Dota management APIs for seamless integration with AI assistants and development tools.

## 🚀 Quick Setup

**One-command installation:**
```bash
cd mcp && npm run setup
```

This single command will:
1. Install all dependencies
2. Build the TypeScript project
3. Automatically configure the MCP server in Cursor's settings
4. Display available tools and usage information

After running this command, **restart Cursor** to load the new MCP server.

## 📋 Manual Installation

If you prefer to set up manually:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Configure in Cursor:**
   Add to your `~/.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "dota-management": {
         "command": "node",
         "args": ["/absolute/path/to/mcp/build/index.js"],
         "env": {
           "DOTA_API_URL": "http://localhost:3000"
         }
       }
     }
   }
   ```

## Features

### 🏢 Organization Management
- List organizations/tenants
- Proper org/tenant ID handling across all operations

### 📱 Application Management
- Create new applications
- Get application details
- List applications for organizations

### 🚀 Deployment Management
- List deployments for applications
- Create new deployments
- Get deployment details
- Update deployment metadata
- Delete deployments

### 📦 Release Management
- Update release metadata (description, rollout, mandatory flags, etc.)
- Get release history with full package history
- Promote releases between deployments

### 📊 Metrics & Analytics
- Deployment metrics and statistics
- Release adoption rates
- Rollback analytics

### 👥 Collaborator Management
- List application collaborators
- Add new collaborators with permissions
- Remove collaborators

## Available Tools (16 total)

### Organization Management (2 tools)
- `list_organizations` - List all organizations/tenants
- `list_apps` - List applications for specific organization

### Application Management (2 tools)
- `create_app` - Create new applications
- `get_app` - Get application details

### Deployment Management (5 tools)
- `list_deployments` - List deployments for applications
- `create_deployment` - Create new deployments  
- `get_deployment` - Get deployment details
- `update_deployment` - Update release metadata (rollout, flags)
- `delete_deployment` - Delete deployments

### Release Management (4 tools)
- `update_release` - Update release metadata
- `get_release_history` - Get release history
- `promote_release` - Promote releases between deployments

### Metrics & Analytics (1 tool)
- `get_deployment_metrics` - Get deployment metrics and analytics

### Collaborator Management (2 tools)
- `list_collaborators` - List app collaborators
- `add_collaborator` - Add collaborators to apps
- `remove_collaborator` - Remove collaborators from apps

## Configuration

Set the `DOTA_API_URL` environment variable to point to your Dota server:

```bash
export DOTA_API_URL=http://localhost:3000
```

## MCP Client Integration

### Claude Desktop

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "dota-management": {
      "command": "node",
      "args": ["/path/to/dota-management-mcp-server/build/index.js"],
      "env": {
        "DOTA_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## API Coverage

This MCP server covers the following Dota management operations:

✅ **Organization operations** - List orgs, org-scoped app listing  
✅ **Application lifecycle** - Create, get, list applications  
✅ **Deployment management** - Full CRUD operations for deployments  
✅ **Release management** - Update, promote, and track releases  
✅ **Collaboration** - Manage team access to applications  
✅ **Analytics** - Deployment metrics and release statistics  

❌ **Excluded** (as requested):
- Token management APIs (security sensitive)
- Account management APIs (user data sensitive)
- Create release API (requires file uploads not supported via MCP)

## Release Creation

To create initial releases with actual files, use the Dota CLI:

```bash
# Create initial release with files
dota release MyApp ./app-files 1.0.0 -d Staging

# Then use MCP tools to manage and promote
# promote_release(MyApp, "Staging", "Production", "v1.0.0")
```

## Authentication

All tools require a valid authentication token passed as the `authToken` parameter. The server supports:

- Bearer token authentication
- Organization/tenant scoping via `tenant` parameter
- Proper error handling for unauthorized requests

## Testing

Run the included test script:

```bash
node test-mcp.js
```

This validates:
- Server initialization ✅
- Tool discovery (16 tools) ✅
- MCP protocol compliance ✅

## Error Handling

The server includes comprehensive error handling:
- **API errors** - Proper HTTP error response forwarding
- **Validation errors** - Input validation with helpful messages  
- **Network errors** - Connection and timeout handling
- **Authentication errors** - Clear auth failure messages

## Development

- **TypeScript** - Fully typed with comprehensive interfaces
- **Zod validation** - Runtime input validation for all tools
- **Modular design** - Clean separation of concerns
- **Comprehensive logging** - Detailed error reporting

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `axios` - HTTP client for API requests
- `zod` - Runtime input validation

Built with ❤️ for the Dota ecosystem 