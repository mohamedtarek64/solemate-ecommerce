#!/bin/bash

# Quick Start Script for SoleMate E-Commerce
# Automates the initial setup process

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SoleMate Quick Start                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed!${NC}"
    echo -e "${YELLOW}Please install Docker first: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed!${NC}"
    echo -e "${YELLOW}Please install Docker Compose first: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Step 1: Create environment files
echo -e "${BLUE}[1/6] Creating environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${YELLOW}! backend/.env already exists, skipping${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}! frontend/.env already exists, skipping${NC}"
fi

echo ""

# Step 2: Start Docker containers
echo -e "${BLUE}[2/6] Starting Docker containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Step 3: Wait for services to be ready
echo -e "${BLUE}[3/6] Waiting for services to be ready...${NC}"
echo -e "${YELLOW}This may take a minute...${NC}"
sleep 15

# Check MySQL
echo -ne "  MySQL... "
for i in {1..30}; do
    if docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    sleep 2
done

# Check Redis
echo -ne "  Redis... "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
fi

echo ""

# Step 4: Install backend dependencies
echo -e "${BLUE}[4/6] Installing backend dependencies...${NC}"
docker-compose exec -T backend composer install --no-interaction
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Step 5: Setup database
echo -e "${BLUE}[5/6] Setting up database...${NC}"

# Generate application key
echo -ne "  Generating app key... "
docker-compose exec -T backend php artisan key:generate --force
echo -e "${GREEN}✓${NC}"

# Run migrations
echo -ne "  Running migrations... "
docker-compose exec -T backend php artisan migrate --force
echo -e "${GREEN}✓${NC}"

# Seed database
echo -ne "  Seeding database... "
docker-compose exec -T backend php artisan db:seed --force
echo -e "${GREEN}✓${NC}"

# Create storage link
echo -ne "  Creating storage link... "
docker-compose exec -T backend php artisan storage:link
echo -e "${GREEN}✓${NC}"

echo ""

# Step 6: Install frontend dependencies
echo -e "${BLUE}[6/6] Installing frontend dependencies...${NC}"
docker-compose exec -T frontend npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Success message
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete! 🎉                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Access your application:${NC}"
echo -e "  ${GREEN}Frontend:${NC}    http://localhost:3000"
echo -e "  ${GREEN}Backend API:${NC} http://localhost:8000/api"
echo -e "  ${GREEN}PHPMyAdmin:${NC}  http://localhost:8080"
echo -e "  ${GREEN}Redis GUI:${NC}   http://localhost:8081"
echo ""
echo -e "${BLUE}Default Admin Credentials:${NC}"
echo -e "  ${YELLOW}Email:${NC}    admin@solemate.com"
echo -e "  ${YELLOW}Password:${NC} password123"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  ${YELLOW}View logs:${NC}        docker-compose logs -f"
echo -e "  ${YELLOW}Stop services:${NC}    docker-compose down"
echo -e "  ${YELLOW}Restart:${NC}          docker-compose restart"
echo -e "  ${YELLOW}Run health check:${NC} ./docker/scripts/healthcheck.sh"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"

