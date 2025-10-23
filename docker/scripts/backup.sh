#!/bin/bash

# Database Backup Script for Docker
# This script creates automated backups of MySQL database

set -e

# Configuration
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="solemate_backup_${DATE}.sql"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform backup
echo -e "${YELLOW}Creating backup: ${BACKUP_FILE}${NC}"
mysqldump -h ${MYSQL_HOST} \
  -u ${MYSQL_USER} \
  -p${MYSQL_PASSWORD} \
  --single-transaction \
  --routines \
  --triggers \
  --databases ${MYSQL_DATABASE} \
  > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# Check if backup was successful
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}.gz" ]; then
    echo -e "${GREEN}Backup completed successfully: ${BACKUP_FILE}.gz${NC}"
    
    # Get file size
    SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}Backup size: ${SIZE}${NC}"
else
    echo -e "${RED}Backup failed!${NC}"
    exit 1
fi

# Remove old backups (older than RETENTION_DAYS)
echo -e "${YELLOW}Removing backups older than ${RETENTION_DAYS} days...${NC}"
find ${BACKUP_DIR} -name "solemate_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# List remaining backups
echo -e "${GREEN}Current backups:${NC}"
ls -lh ${BACKUP_DIR}/solemate_backup_*.sql.gz 2>/dev/null || echo "No backups found"

echo -e "${GREEN}Backup process completed!${NC}"


