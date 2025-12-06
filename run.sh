#!/bin/bash

# Side-B Project Startup Script
# This script starts MongoDB, the backend, and the frontend

set -e  # Exit on error

echo " Starting Side-B..."

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start Databases using Docker Compose
echo -e "${BLUE} Starting Databases (MongoDB, Dgraph, Cassandra)...${NC}"

# Check for potential port conflicts from non-compose containers
if docker ps --format '{{.Names}}' | grep -q "^cassandra$"; then
    echo -e "${YELLOW}Stopping conflicting container 'cassandra'...${NC}"
    docker stop cassandra
fi
if docker ps --format '{{.Names}}' | grep -q "^dgraph$"; then
    echo -e "${YELLOW}Stopping conflicting container 'dgraph'...${NC}"
    docker stop dgraph
fi

# Try using 'docker compose' (plugin) first, fall back to 'docker-compose' (standalone)
# NOTE: We are forcing 'docker compose' (v2) if available because 'docker-compose' (v1)
# has issues with newer python requests/urllib3 libraries ("http+docker" scheme error).
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
elif docker-compose --version >/dev/null 2>&1; then
    # If only v1 is available, we might still fail, but we have no choice.
    # The user might need to install docker-compose-plugin.
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${YELLOW}Neither 'docker compose' nor 'docker-compose' found.${NC}"
    echo "Please install Docker Compose v2 (plugin) or v1."
    exit 1
fi

echo "Using: $DOCKER_COMPOSE_CMD"
$DOCKER_COMPOSE_CMD up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Databases started${NC}"
else
    echo -e "${YELLOW}  Docker Compose reported an issue. Please check if ports are available.${NC}"
    exit 1
fi

# Wait a moment for databases to be ready
sleep 5

# Start Backend
echo -e "${BLUE} Starting Backend...${NC}"
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate

# Check if dependencies are installed
if [ ! -f "venv/.deps_installed" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip install -r requirements.txt
    touch venv/.deps_installed
fi

# Start backend in background
echo "Starting FastAPI server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Go back to root directory
cd "$SCRIPT_DIR"

# Start Frontend
echo -e "${BLUE}  Starting Frontend...${NC}"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
echo "Starting Vite dev server..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN} Side-B is now running!${NC}"
echo ""
echo "Services:"
echo "  • MongoDB:   running on port 27017"
echo "  • Dgraph:    running on ports 8080, 9080"
echo "  • Cassandra: running on port 9042"
echo "  • Backend:   http://127.0.0.1:8000"
echo "  • API Docs: http://127.0.0.1:8000/docs"
echo "  • Frontend: http://localhost:5173"
echo ""
echo "Logs:"
echo "  • Backend:  tail -f backend.log"
echo "  • Frontend: tail -f frontend.log"
echo ""
echo "To stop all services, run: ./stop.sh"
echo ""
