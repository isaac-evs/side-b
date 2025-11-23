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

# Stop Backend
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm backend.pid
        echo -e "${GREEN}✓ Backend stopped${NC}"
    else
        echo "Backend process not found"
        rm backend.pid
    fi
else
    echo "No backend PID file found"
fi

# Stop Frontend
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm frontend.pid
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    else
        echo "Frontend process not found"
        rm frontend.pid
    fi
else
    echo "No frontend PID file found"
fi

# Stop MongoDB (optional - commented out by default to preserve data)
# Uncomment the following lines if you want to stop MongoDB as well
# echo "Stopping MongoDB..."
# docker stop side-b-mongodb
# echo -e "${GREEN}✓ MongoDB stopped${NC}"

echo ""
echo -e "${GREEN}✨ Side-B has been stopped${NC}"
echo ""
echo "💡 MongoDB is still running to preserve your data."
echo "   To stop MongoDB: docker stop side-b-mongodb"
echo ""
