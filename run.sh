#!/bin/bash

# Side-B Project Startup Script
# This script starts MongoDB, the backend, and the frontend

set -e  # Exit on error

echo "🚀 Starting Side-B..."

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start MongoDB
echo -e "${BLUE}📦 Starting MongoDB...${NC}"
if docker ps | grep -q side-b-mongodb; then
    echo -e "${GREEN}✓ MongoDB is already running${NC}"
else
    if docker ps -a | grep -q side-b-mongodb; then
        echo "Starting existing MongoDB container..."
        docker start side-b-mongodb
    else
        echo "Creating and starting new MongoDB container..."
        docker run -d --name side-b-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=side_b_db mongo:latest
    fi
    echo -e "${GREEN}✓ MongoDB started${NC}"
fi

# Wait a moment for MongoDB to be ready
sleep 2

# Start Backend
echo -e "${BLUE}🐍 Starting Backend...${NC}"
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
echo -e "${BLUE}⚛️  Starting Frontend...${NC}"
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
echo -e "${GREEN}✨ Side-B is now running!${NC}"
echo ""
echo "📝 Services:"
echo "  • MongoDB:  running on port 27017"
echo "  • Backend:  http://127.0.0.1:8000"
echo "  • API Docs: http://127.0.0.1:8000/docs"
echo "  • Frontend: http://localhost:5173"
echo ""
echo "📋 Logs:"
echo "  • Backend:  tail -f backend.log"
echo "  • Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop all services, run: ./stop.sh"
echo ""
