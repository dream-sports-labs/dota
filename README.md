###### ⚠️ This is a fork of [code-push-server](https://github.com/microsoft/code-push-server). All credit goes to the original author.

# DOTA - Over-the-Air Updates for React Native Apps

DOTA enables React Native developers to deploy mobile app updates directly to their users' devices. It consists of two parts: DOTA Server where developers publish app updates (JS, HTML, CSS or image changes), and [Microsoft React Native Client SDK](https://github.com/microsoft/react-native-code-push) that enables querying for updates from within an app.

## 🚀 Overview

DOTA provides a complete solution for React Native over-the-air updates, allowing you to:

- Deploy app updates without going through app stores
- Target updates to specific app versions
- Control the rollout percentage of updates
- Make updates mandatory when critical
- Monitor deployment metrics
- Manage multiple deployment environments (Staging, Production)

## 🔗 Quick Links

- [Detailed Documentation](https://dota.dreamsportslabs.com/)
- [Connect with us on discord](https://discord.gg/Sa6a5Scj)

## 📦 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Docker Desktop (must be running)
- npm (Node Package Manager)
- Google OAuth configuration (optional)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/dream-sports-labs/dota
```

2. Run the launch script:
```bash
./launchdota.sh /path/to/your/directory
```
This will install DOTA in the specified directory. The directory will be automatically added to .gitignore if it's a git repository.

After successful installation, you should see:
- Server running at `http://localhost:3010`
- CLI logged in (verify with `dota --version` and `dota whoami`)
- Web server running at `http://localhost:3000`

## 🤝 Contribute to DOTA

DOTA is an open-source project and welcomes contributions from the community. For details on how to contribute, please see our [guide to contributing](/CONTRIBUTING.md).

### DOTA Server

The DOTA server, located in the `api` subdirectory, allows you to build, deploy and manage DOTA updates yourself. You can deploy the server in multiple ways:

- **AWS** - Deploy to your own AWS infrastructure
- **Azure** - Run as an Azure App Service
- **Local** - Run on your own servers or development environment

For detailed information about the DOTA server, including installation instructions and usage details, please refer to the [DOTA Server README](./api/README.md).

### DOTA CLI

The DOTA CLI, located in the `cli` subdirectory, is a command-line tool that allows developers to interact with the DOTA server. For detailed information about the DOTA CLI, including installation instructions and usage details, please refer to the [DOTA CLI README](./cli/README.md).

### DOTA Web

The DOTA Web Dashboard, located in the `web` subdirectory, is a web-based management interface that provides a user-friendly way to manage your deployments, monitor metrics, and configure your DOTA environment. For detailed information about the DOTA Web Dashboard, including installation instructions and usage details, please refer to the [DOTA Web README](https://dota.dreamsportslabs.com/documentation/web/dashboard).

## 🛠️ Deployment Options

### Local Deployment

For development or self-hosted environments, DOTA can be run locally. The server requires storage support (Azure Blob Storage or Azurite emulator locally).

### AWS Deployment

DOTA can be deployed to AWS using your preferred AWS services for computing and storage(docker emulator locally).

### Azure Deployment

DOTA is designed to run as an Azure App Service with Azure Blob Storage for backend storage needs.

## 🛠️ Tech Stack

### Backend (API)
- **Runtime**: Node.js (>=18.0.0)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: 
  - MySQL (via Sequelize ORM)
  - Redis for caching
- **Authentication**: 
  - Google OAuth
- **Cloud Services**:
  - AWS SDK for S3 and CloudFront
  - Azure Storage (Blob, Queue, Tables)
- **Testing**: Jest
- **Monitoring**: 
  - Application Insights
  - Datadog APM

### Frontend (Web Dashboard)
- **Framework**: Remix.js
- **UI Library**: Mantine UI
- **State Management**: React Query
- **Styling**: 
  - Tailwind CSS
  - PostCSS
- **Testing**: 
  - Vitest
  - React Testing Library
- **Build Tools**: 
  - Vite
  - TypeScript
  - ESLint

### CLI Tool
- **Language**: TypeScript
- **Build System**: Node.js
- **Package Manager**: npm/pnpm

### Infrastructure
- **Containerization**: Docker
- **Storage Options**:
  - Local JSON storage
  - AWS S3
  - Azure Blob Storage
- **Development Tools**:
  - ESLint
  - Prettier
  - TypeScript

## ⚖️ License

This code is provided under the MIT License, see the [LICENSE](./LICENSE) to learn more.
