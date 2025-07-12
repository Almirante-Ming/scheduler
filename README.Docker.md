# Scheduler Docker Setup

This repository contains a containerized setup for the Scheduler application with two services:

- **Lumus**: Flask-based API backend
- **Umbra**: React-based frontend

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│     Umbra       │         │     Lumus       │
│   (Frontend)    │◄────────┤   (Backend)     │
│  Port: 7070     │         │  Port: 3001     │
│  Node.js Alpine │         │ Python 3.13.5   │
└─────────────────┘         └─────────────────┘
         │                           │
         └───────────────────────────┘
              scheduler-network
```

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. **Start the application**:
   ```bash
   ./docker-run.sh up
   ```

2. **Access the services**:
   - **Frontend**: http://localhost:7070
   - **Backend API**: http://localhost:3001

### Available Commands

```bash
./docker-run.sh up      # Start the application
./docker-run.sh down    # Stop the application
./docker-run.sh build   # Build containers
./docker-run.sh logs    # Show logs
./docker-run.sh restart # Restart the application
./docker-run.sh clean   # Clean up containers and volumes
```

### Manual Docker Compose Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild containers
docker compose build
```

## Service Configuration