# 🐳 Docker Setup Guide - SoleMate E-Commerce

Complete guide for running SoleMate using Docker containers.

---

## 📋 Prerequisites

- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher
- **Git** (to clone the repository)

### Install Docker

**Windows/Mac:**
- Download [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

---

## 🚀 Quick Start (Development)

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/solemate-ecommerce.git
cd solemate-ecommerce
```

### 2. Start Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access Services

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **PHPMyAdmin:** http://localhost:8080
- **Redis Commander:** http://localhost:8081

**Default Credentials:**
- Admin Email: `admin@solemate.com`
- Admin Password: `password123`

---

## 🏭 Production Deployment

### 1. Prepare Environment

Create `.env.docker` file (copy from `.env.docker.example`):

```bash
cp .env.docker.example .env.docker
nano .env.docker
```

**Configure these important values:**
```env
APP_KEY=base64:your-generated-key
DB_ROOT_PASSWORD=your-secure-password
DB_PASSWORD=your-secure-password
REDIS_PASSWORD=your-secure-password
STRIPE_KEY=pk_live_your_live_key
STRIPE_SECRET=sk_live_your_live_secret
```

### 2. Build Production Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

### 3. Start Production Environment

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate --force

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec backend php artisan db:seed

# Cache configurations
docker-compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan route:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan view:cache
```

---

## 📦 Services Overview

### Development Services (`docker-compose.yml`)

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **mysql** | ecommerce_mysql | 3306 | MySQL 8.0 Database |
| **redis** | ecommerce_redis | 6379 | Redis Cache & Queue |
| **backend** | ecommerce_backend | 8000 | Laravel API |
| **frontend** | ecommerce_frontend | 3000 | Vue.js App |
| **nginx** | ecommerce_nginx | 80, 443 | Web Server |
| **phpmyadmin** | ecommerce_phpmyadmin | 8080 | Database Manager |
| **redis-commander** | ecommerce_redis_commander | 8081 | Redis GUI |

### Production Services (`docker-compose.prod.yml`)

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **mysql** | solemate_mysql_prod | 3306 | MySQL Database |
| **redis** | solemate_redis_prod | 6379 | Redis Cache |
| **backend** | solemate_backend_prod | 9000 | Laravel API (PHP-FPM) |
| **queue-worker** | solemate_queue_prod | - | Queue Processor |
| **scheduler** | solemate_scheduler_prod | - | Task Scheduler |
| **frontend** | solemate_frontend_prod | 80 | Vue.js (Nginx) |
| **nginx** | solemate_nginx_prod | 80, 443 | Reverse Proxy |
| **backup** | solemate_backup | - | Database Backup |

---

## 🛠️ Common Docker Commands

### Container Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Check service status
docker-compose ps

# View resource usage
docker stats
```

### Database Operations

```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u dev_user -p

# Run migrations
docker-compose exec backend php artisan migrate

# Seed database
docker-compose exec backend php artisan db:seed

# Reset database
docker-compose exec backend php artisan migrate:fresh --seed

# Backup database
docker-compose exec mysql mysqldump -u dev_user -p ecommerce_db > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u dev_user -p ecommerce_db < backup.sql
```

### Laravel Artisan Commands

```bash
# Clear cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear
docker-compose exec backend php artisan view:clear

# Generate key
docker-compose exec backend php artisan key:generate

# Run queue worker
docker-compose exec backend php artisan queue:work

# Run tests
docker-compose exec backend php artisan test
```

### Frontend Commands

```bash
# Install dependencies
docker-compose exec frontend npm install

# Build for production
docker-compose exec frontend npm run build

# Run linter
docker-compose exec frontend npm run lint
```

---

## 🔧 Troubleshooting

### Issue: Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### Issue: Permission Denied

```bash
# Fix storage permissions
docker-compose exec backend chmod -R 775 storage bootstrap/cache
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Issue: Database Connection Failed

```bash
# Check MySQL is running
docker-compose ps mysql

# Check logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql

# Wait for health check
docker-compose exec mysql mysqladmin ping -h localhost
```

### Issue: Redis Connection Failed

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
docker-compose exec redis redis-cli ping
# Should return: PONG

# Flush Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### Issue: Container Fails to Start

```bash
# View detailed logs
docker-compose logs --tail=100 backend

# Rebuild container
docker-compose build --no-cache backend
docker-compose up -d backend

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

---

## 🗄️ Database Backup & Restore

### Automated Backup (Production)

The production setup includes an automated backup service:

```bash
# Run backup manually
docker-compose -f docker-compose.prod.yml run --rm backup

# List backups
ls -lh backup/

# Backups are automatically deleted after 30 days (configurable)
```

### Manual Backup

```bash
# Create backup directory
mkdir -p backup

# Backup database
docker-compose exec mysql mysqldump \
  -u dev_user \
  -pdev_pass \
  --single-transaction \
  --routines \
  --triggers \
  ecommerce_db > backup/manual_backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup/manual_backup_*.sql
```

### Restore from Backup

```bash
# Decompress backup
gunzip backup/backup_file.sql.gz

# Restore
docker-compose exec -T mysql mysql \
  -u dev_user \
  -pdev_pass \
  ecommerce_db < backup/backup_file.sql
```

---

## 🔐 Security Best Practices

1. **Change Default Passwords**
   - Update all passwords in `.env.docker`
   - Use strong, unique passwords

2. **Enable SSL/TLS**
   - Configure SSL certificates in `docker/nginx/ssl/`
   - Uncomment SSL server block in `nginx.prod.conf`

3. **Restrict Port Access**
   - Remove port mappings for internal services
   - Use reverse proxy for external access

4. **Regular Updates**
   ```bash
   # Update images
   docker-compose pull
   docker-compose up -d
   ```

5. **Environment Variables**
   - Never commit `.env` files
   - Use Docker secrets for sensitive data

---

## 📊 Monitoring

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Container details
docker-compose ps
docker inspect ecommerce_backend
```

### Health Checks

```bash
# Check all services
docker-compose ps

# Test API health
curl http://localhost:8000/api/health

# Test frontend
curl http://localhost:3000
```

---

## 🚀 Performance Optimization

### Production Optimizations

1. **Enable OPcache** (Already configured in `php.prod.ini`)

2. **Use Redis for Caching**
   ```bash
   docker-compose exec backend php artisan config:cache
   docker-compose exec backend php artisan route:cache
   docker-compose exec backend php artisan view:cache
   ```

3. **Optimize Images**
   - Use multi-stage builds
   - Minimize layer count
   - Use Alpine-based images

4. **Resource Limits**
   ```yaml
   # Add to docker-compose.prod.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
   ```

---

## 🆘 Support

For issues:
- Check logs: `docker-compose logs`
- View documentation: [README.md](README.md)
- Report bugs: [GitHub Issues](https://github.com/YOUR_USERNAME/solemate-ecommerce/issues)

---

**Happy Dockerizing! 🐳**

