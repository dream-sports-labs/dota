#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get the user's home directory and construct the mcp.json path
const mcpConfigPath = path.join(os.homedir(), '.cursor', 'mcp.json');
const currentDir = __dirname;
const mcpServerPath = path.join(currentDir, 'build', 'index.js');

// Default MCP configuration
const defaultConfig = {
  mcpServers: {}
};

// Dota management server configuration
const dotaServerConfig = {
  command: "node",
  args: [mcpServerPath],
  env: {
    DOTA_API_URL: "http://localhost:3000"
  }
};

try {
  // Ensure the .cursor directory exists
  const cursorDir = path.dirname(mcpConfigPath);
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
    console.log('✓ Created .cursor directory');
  }

  // Read existing config or create default
  let config = defaultConfig;
  if (fs.existsSync(mcpConfigPath)) {
    try {
      const configContent = fs.readFileSync(mcpConfigPath, 'utf8');
      config = JSON.parse(configContent);
      console.log('✓ Loaded existing mcp.json');
    } catch (parseError) {
      console.log('⚠ mcp.json exists but is invalid, creating backup and using default config');
      fs.copyFileSync(mcpConfigPath, `${mcpConfigPath}.backup.${Date.now()}`);
      config = defaultConfig;
    }
  }

  // Ensure mcpServers object exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Add or update the dota-management server
  config.mcpServers['dota-management'] = dotaServerConfig;

  // Write the updated configuration
  fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2));
  
  console.log('✅ Setup completed successfully!');
  console.log('📍 MCP server configured at:', mcpConfigPath);
  console.log('🔧 Server path:', mcpServerPath);
  console.log('🌐 API URL:', dotaServerConfig.env.DOTA_API_URL);
  console.log('');
  console.log('🎉 The Dota Management MCP server is now ready to use in Cursor!');
  console.log('📖 Restart Cursor to load the new MCP server configuration.');
  console.log('');
  console.log('💡 Available tools:');
  console.log('   • Organization Management (list_organizations, list_apps)');
  console.log('   • Application Management (create_app, get_app)');
  console.log('   • Deployment Management (create/list/update/delete deployments)');
  console.log('   • Release Management (update/promote releases, release history)');
  console.log('   • Collaborator Management (add/remove/list collaborators)');
  console.log('   • Metrics & Analytics (get_deployment_metrics)');
  console.log('   • Release Guide (release_update_guide)');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 