#!/bin/bash

# Side-B Project Shutdown Script
# This script stops the backend, frontend, and MongoDB

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}🛑 Stopping Side-B...${NC}"

# Stop Backend - kill all uvicorn processes
echo "Stopping Backend..."
pkill -f "uvicorn app.main:app" && echo -e "${GREEN}✓ Backend stopped${NC}" || echo "Backend process not found"
[ -f "backend.pid" ] && rm backend.pid

# Stop Frontend - kill all vite processes
echo "Stopping Frontend..."
pkill -f "vite" && echo -e "${GREEN}✓ Frontend stopped${NC}" || echo "Frontend process not found"
[ -f "frontend.pid" ] && rm frontend.pid

# Stop Databases (optional - commented out by default to preserve data)
# Uncomment the following lines if you want to stop the databases as well
# echo "Stopping Databases..."
# if docker compose version >/dev/null 2>&1; then
#     docker compose stop
# else
#     docker-compose stop
# fi
# echo -e "${GREEN}✓ Databases stopped${NC}"

echo ""
echo -e "${GREEN}✨ Side-B has been stopped${NC}"
echo ""
echo "💡 Databases are still running to preserve your data."
echo "   To stop them: docker compose stop (or docker-compose stop)"
echo ""
