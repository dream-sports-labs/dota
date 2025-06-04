#!/bin/bash

# Function to load environment variables
load_env() {
  # Check for .env file, fallback to .env.example
  local env_file=""
  if [ -f .env ]; then
    echo "📝 Loading environment from .env file..."
    env_file=".env"
  elif [ -f .env.example ]; then
    echo "📝 Loading environment from .env.example file..."
    env_file=".env.example"
  else
    echo "⚠️  No .env or .env.example file found, using default values"
    return
  fi

  # Read file line by line, preserving all content exactly as is
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# || -z "$line" ]] && continue
    
    # Check if line contains an equals sign
    if [[ "$line" == *"="* ]]; then
      # Extract variable name (everything before the first =)
      local var_name="${line%%=*}"
      # Trim whitespace
      var_name="$(echo "$var_name" | xargs)"
      
      # Extract variable value (everything after the first =)
      local var_value="${line#*=}"
      
      # Only set if the variable isn't already in the environment
      if [ -n "$var_name" ] && [ -z "${!var_name+x}" ]; then
        export "$var_name=$var_value"
      fi
    fi
  done < "$env_file"
}

# Function to setup Node.js environment
setup_node() {
  echo "🔄 Setting up Node.js environment..."
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load nvm
  
  # Use Node.js 20, install if not available
  nvm use 20 || nvm install 20
  
  # Verify Node.js version
  NODE_VERSION=$(node -v)
  echo "✅ Using Node.js $NODE_VERSION"
}

# Function to handle cleanup on exit
cleanup() {
  echo "Cleaning up..."
  # Find and kill any process using the configured port
  lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
  
  # Find and kill the web process if it exists
  if [ -n "$WEB_PID" ]; then
    echo "Stopping web server..."
    kill $WEB_PID 2>/dev/null || true
  fi
  
  exit 0
}

# Function to display error messages and exit
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if dota CLI is installed
check_dota_cli() {
  # Store current directory and important environment variables
  local CURRENT_DIR=$(pwd)
  local PREV_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
  local PREV_GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
  
  # Change to CLI directory
  pwd
  
  # Verify dota command is available
  if ! command -v dota &> /dev/null; then
    echo "❌ Error: DOTA CLI is not found in PATH"
    echo "   Please ensure it is installed correctly:"
    echo "   1. Check if you're in the correct directory"
    echo "   2. Run 'npm install' in the cli directory"
    echo "   3. Ensure the cli directory is in your PATH"
    # Return to original directory
    cd "$CURRENT_DIR"
    
    # Restore environment variables
    if [ -n "$PREV_GOOGLE_CLIENT_ID" ]; then
      export GOOGLE_CLIENT_ID="$PREV_GOOGLE_CLIENT_ID"
    fi
    if [ -n "$PREV_GOOGLE_CLIENT_SECRET" ]; then
      export GOOGLE_CLIENT_SECRET="$PREV_GOOGLE_CLIENT_SECRET"
    fi
    
    exit 1
  fi
  
  # Return to original directory
  cd "$CURRENT_DIR"
  
  # Restore environment variables
  if [ -n "$PREV_GOOGLE_CLIENT_ID" ]; then
    export GOOGLE_CLIENT_ID="$PREV_GOOGLE_CLIENT_ID"
  fi
  if [ -n "$PREV_GOOGLE_CLIENT_SECRET" ]; then
    export GOOGLE_CLIENT_SECRET="$PREV_GOOGLE_CLIENT_SECRET"
  fi
}

# Function to handle login
handle_login() {
  echo "🔑 Attempting to login to CLI..."
  
  # Store current directory and important environment variables
  local CURRENT_DIR=$(pwd)
  local PREV_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
  local PREV_GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
  
  # Change to CLI directory and ensure PATH is set
  cd ../cli
  export PATH="$(pwd)/node_modules/.bin:$PATH"
  
  # Check if already logged in
  if dota whoami &> /dev/null; then
    echo "ℹ️  Already logged in. Current user:"
    dota whoami
    cd "$CURRENT_DIR"
    
    # Restore environment variables
    if [ -n "$PREV_GOOGLE_CLIENT_ID" ]; then
      export GOOGLE_CLIENT_ID="$PREV_GOOGLE_CLIENT_ID"
    fi
    if [ -n "$PREV_GOOGLE_CLIENT_SECRET" ]; then
      export GOOGLE_CLIENT_SECRET="$PREV_GOOGLE_CLIENT_SECRET"
    fi
    
    return 0
  fi
  
  # Try to login
  if ! dota login http://localhost:$PORT --accessKey=mock-google-token; then
    echo "❌ Failed to login to CLI"
    echo "   Please check:"
    echo "   1. Server is running correctly"
    echo "   2. You have proper permissions"
    echo "   3. No conflicting sessions"
    cd "$CURRENT_DIR"
    
    # Restore environment variables
    if [ -n "$PREV_GOOGLE_CLIENT_ID" ]; then
      export GOOGLE_CLIENT_ID="$PREV_GOOGLE_CLIENT_ID"
    fi
    if [ -n "$PREV_GOOGLE_CLIENT_SECRET" ]; then
      export GOOGLE_CLIENT_SECRET="$PREV_GOOGLE_CLIENT_SECRET"
    fi
    
    exit 1
  fi
  
  echo "✅ Successfully logged in. Current user:"
  dota whoami
  
  # Return to original directory
  cd "$CURRENT_DIR"
  
  # Restore environment variables
  if [ -n "$PREV_GOOGLE_CLIENT_ID" ]; then
    export GOOGLE_CLIENT_ID="$PREV_GOOGLE_CLIENT_ID"
  fi
  if [ -n "$PREV_GOOGLE_CLIENT_SECRET" ]; then
    export GOOGLE_CLIENT_SECRET="$PREV_GOOGLE_CLIENT_SECRET"
  fi
}

# Function to setup AWS environment
setup_aws() {
  echo "🚀 Starting AWS setup process..."
  
  # Inflate .env file if setup script exists
  if [ -f "scripts/setup-aws-env.js" ]; then
    echo "📝 Inflating .env file..."
    # Save all environment variables before running the setup script
    if [ -f .env ]; then
      cp .env .env.backup
    fi
    
    # Run the setup script
    node scripts/setup-aws-env.js
    
    # Reload environment variables, keeping existing ones
    load_env
    
    # Restore backup if it exists
    if [ -f .env.backup ]; then
      mv .env.backup .env
    fi
  fi
  
  # Install dependencies
  echo "📦 Installing dependencies..."
  npm install
  
  # Initialize AWS (docker compose up)
  echo "🐳 Starting AWS services..."
  docker compose up -d
  
  # Wait for services to be ready
  echo "⏳ Waiting for services to be ready..."
  sleep 5
  
  # Check if services are running
  if ! docker compose ps | grep -q "Up"; then
    echo "❌ Docker services failed to start properly"
    exit 1
  fi
}

# Function to setup web environment
setup_web() {
    echo "🌐 Setting up web environment..."
    
    # Store current environment variables and directory
    local PREV_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
    local PREV_GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
    local CURRENT_DIR=$(pwd)
    
    # Change to web directory
    cd ../web

    # Create .env file with mock values for development, preserving existing values
    if [ -f .env ]; then
        echo "Using existing .env file in web directory"
    else
        echo "Creating new .env file in web directory"
        G_CLIENT_ID=${PREV_GOOGLE_CLIENT_ID:-"mock-client-id"}
        G_CLIENT_SECRET=${PREV_GOOGLE_CLIENT_SECRET:-"mock-client-secret"}
        S_URL=${DOTA_SERVER_URL:-"http://localhost:$PORT"}
        S3_BUCKET=${AWS_S3_BUCKET:-"local-bucket"}
        AWS_SECRET=${aws_secret_access_key:-"test"}
        AWS_KEY=${aws_access_key_id:-"test"}
        cat > .env << EOL
GOOGLE_CLIENT_ID=$G_CLIENT_ID
GOOGLE_CLIENT_SECRET=$G_CLIENT_SECRET
DOTA_SERVER_URL=$S_URL
AWS_S3_BUCKET=$S3_BUCKET
aws_secret_access_key=$AWS_SECRET
aws_access_key_id=$AWS_KEY
EOL
    fi

    # Try to use pnpm, install if missing, fallback to npm if install fails
    echo "🚀 Starting web server..."
    if ! command -v pnpm &> /dev/null; then
        echo "pnpm not found, attempting to install globally..."
        if command -v npm &> /dev/null; then
            npm install -g pnpm
        fi
    fi

    if command -v pnpm &> /dev/null; then
        echo "Using pnpm for install/build/dev"
        pnpm install
        pnpm build
        pnpm start > ../api/logs/web_server.log 2>&1 &
    else
        echo "pnpm install failed or not available, falling back to npm"
        npm install
        npm run build
        npm run start > ../api/logs/web_server.log 2>&1 &
    fi
    WEB_PID=$!
    
    # Wait a moment for the web server to start
    echo "⏳ Waiting for web server to start..."
    sleep 5
    
    # Open browser to login page
    echo "🔗 Opening browser to login page..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000/login
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:3000/login
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        start http://localhost:3000/login
    else
        echo "⚠️ Could not automatically open browser. Please visit http://localhost:3000/login"
    fi

    # Restore environment variables and return to original directory
    export GOOGLE_CLIENT_ID="$PREV_GOOGLE_CLIENT_ID"
    export GOOGLE_CLIENT_SECRET="$PREV_GOOGLE_CLIENT_SECRET"
    
    cd "$CURRENT_DIR"
    
    echo "✅ Web setup complete!"
}

# Create logs directory if it doesn't exist
ensure_logs_directory() {
  if [ ! -d "logs" ]; then
    echo "Creating logs directory..."
    mkdir -p logs
  fi
}

# Main script starts here
# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT SIGTERM EXIT

# Change to api directory
cd "$(dirname "$0")"

# Create logs directory
ensure_logs_directory

# Load environment variables
load_env

# Setup Node.js environment
setup_node

# Parse command line arguments
SETUP_ONLY=false
RUN_ONLY=false
WITH_WEB=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --setup-only)
      SETUP_ONLY=true
      shift
      ;;
    --run-only)
      RUN_ONLY=true
      shift
      ;;
    --web)
      WITH_WEB=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Default to running both setup and server if no flags provided
if [ "$SETUP_ONLY" = false ] && [ "$RUN_ONLY" = false ]; then
  SETUP_ONLY=false
  RUN_ONLY=false
fi

# Server Configuration
DEFAULT_PORT=3010
PORT=${PORT:-$DEFAULT_PORT}  # Use PORT if set, otherwise use DEFAULT_PORT

# Run setup if needed
if [ "$SETUP_ONLY" = true ] || [ "$RUN_ONLY" = false ]; then
  setup_aws
fi

# Exit if only setup was requested
if [ "$SETUP_ONLY" = true ]; then
  echo "✅ AWS setup completed!"
  exit 0
fi

# Database Configuration
export DB_HOST=${DB_HOST:-localhost}
export DB_USER=${DB_USER:-root}
export DB_PASS=${DB_PASS:-root}
export DB_NAME=${DB_NAME:-codepushdb}

# AWS Storage Configuration
export STORAGE_PROVIDER=${STORAGE_PROVIDER:-aws}
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-localstack}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-localstack}
export S3_ENDPOINT=${S3_ENDPOINT:-http://localhost:4566}

# Other settings
export PORT=${PORT:-$DEFAULT_PORT}
export EMULATED=${EMULATED:-true}
export NODE_ENV=${NODE_ENV:-development}
export LOCAL_GOOGLE_TOKEN=${LOCAL_GOOGLE_TOKEN:-"mock-google-token"}

# Check if LocalStack is running
if ! curl -s http://localhost:4566 > /dev/null; then
  echo "❌ Error: LocalStack is not running. Please start it with:"
  echo "   docker run --rm -p 4566:4566 -p 4571:4571 localstack/localstack"
  exit 1
else
  echo "🗂️ AWS LocalStack initialized at http://localhost:4566"
fi

# Check if port is already in use and release it
if lsof -ti:$PORT >/dev/null; then
  lsof -ti:$PORT | xargs kill -9 > /dev/null 2>&1
fi

# Check if seed data script for AWS exists and run it
if [ -f "script/storage/seedData.ts" ]; then
  echo "📂 Seeding AWS storage with sample data..."
  npx ts-node script/storage/seedData.ts > /dev/null 2>&1
else
  echo "❌ Warning: No AWS seed data script found at script/storage/seedData.ts"
  exit 1
fi

# Build TypeScript before starting server
echo "🔨 Building application..."
npm run build > /dev/null 2>&1

# Start server with AWS configuration in detached mode
echo "🛜 Starting server with AWS storage on port $PORT..."
LOG_FILE="logs/server_api.log"
# Ensure the log file exists
touch "$LOG_FILE"
# Start the server and redirect output to log file
nohup npm start aws:env > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Wait for server to be ready (checking if port is listening)
echo "⏳ Waiting for server to be ready..."
TIMEOUT=30
COUNTER=0
while ! lsof -i:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  sleep 1
  COUNTER=$((COUNTER + 1))
  # Check if server is still running
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start. Check $LOG_FILE for details."
    exit 1
  fi
  # Add timeout
  if [ $COUNTER -ge $TIMEOUT ]; then
    echo "❌ Server failed to start within $TIMEOUT seconds. Check $LOG_FILE for details."
    kill $SERVER_PID 2>/dev/null
    exit 1
  fi
done

echo "🚀 Server started with AWS storage on port $PORT (PID: $SERVER_PID)"

# Check if port is in use (skip if we've already started the server)
if [ "$RUN_ONLY" = true ] && [ -z "$SERVER_PID" ] && lsof -ti:$PORT >/dev/null 2>&1; then
    error_exit "Port $PORT is already in use. Please free up the port or use a different one."
fi

# Start the server (only if in run-only mode and server isn't already running)
if [ "$RUN_ONLY" = true ] && [ -z "$SERVER_PID" ]; then
    echo "Starting server on port $PORT..."
    npm run dev >> "$LOG_FILE" 2>&1 &
    
    # Wait for server to be ready
    echo "Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:$PORT/health >/dev/null; then
            echo "✅ Server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            error_exit "Server failed to start within 30 seconds. Check $LOG_FILE for details."
        fi
        echo "Waiting... ($i/30)"
        sleep 1
    done
fi

# Setup web if --web flag is provided
if [ "$WITH_WEB" = true ]; then
    setup_web
fi

# Keep the script running
echo "📝 Server log available at: $(pwd)/$LOG_FILE"
if [ "$WITH_WEB" = true ]; then
  echo "📝 Web server log available at: $(pwd)/logs/web_server.log"
fi
echo "ℹ️  Server is running in background with PID: $SERVER_PID"
echo "ℹ️  To stop the server, run: kill $SERVER_PID"
handle_login
echo "✅ Setup complete! You can now use the CLI."

# Keep the script running
wait