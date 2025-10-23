#!/bin/bash

# Health Check Script for SoleMate Services
# Checks if all critical services are running and responding

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
MYSQL_HOST="${MYSQL_HOST:-mysql}"
REDIS_HOST="${REDIS_HOST:-redis}"

# Status counters
HEALTHY=0
UNHEALTHY=0

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SoleMate Health Check               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to check service
check_service() {
    local service_name=$1
    local check_command=$2
    
    echo -ne "${YELLOW}Checking ${service_name}...${NC} "
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Healthy${NC}"
        ((HEALTHY++))
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        ((UNHEALTHY++))
        return 1
    fi
}

# Check Frontend
check_service "Frontend (Vue.js)" \
    "curl -sf ${FRONTEND_URL} -o /dev/null"

# Check Backend API
check_service "Backend API (Laravel)" \
    "curl -sf ${BACKEND_URL}/api/health -o /dev/null"

# Check MySQL
check_service "MySQL Database" \
    "docker-compose exec -T mysql mysqladmin ping -h localhost --silent"

# Check Redis
check_service "Redis Cache" \
    "docker-compose exec -T redis redis-cli ping | grep -q PONG"

# Check Backend Storage Permissions
check_service "Backend Storage Permissions" \
    "docker-compose exec -T backend test -w storage"

# Check Backend Bootstrap Cache Permissions
check_service "Backend Bootstrap Cache" \
    "docker-compose exec -T backend test -w bootstrap/cache"

# Check Queue Worker (if running)
if docker-compose ps | grep -q "queue-worker"; then
    check_service "Queue Worker" \
        "docker-compose ps queue-worker | grep -q 'Up'"
fi

# Check Scheduler (if running)
if docker-compose ps | grep -q "scheduler"; then
    check_service "Scheduler" \
        "docker-compose ps scheduler | grep -q 'Up'"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}Healthy Services: ${HEALTHY}${NC}"
echo -e "${RED}Unhealthy Services: ${UNHEALTHY}${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Exit with error if any service is unhealthy
if [ $UNHEALTHY -gt 0 ]; then
    echo ""
    echo -e "${RED}⚠️  Warning: Some services are unhealthy!${NC}"
    echo -e "${YELLOW}Run 'docker-compose logs' to see detailed errors${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}✓ All services are healthy!${NC}"
    exit 0
fi

