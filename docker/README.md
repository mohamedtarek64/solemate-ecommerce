# Docker Configuration Files

This directory contains all Docker-related configuration files for the SoleMate E-Commerce platform.

---

## 📁 Directory Structure

```
docker/
├── mysql/
│   └── my.cnf                    # MySQL custom configuration
├── nginx/
│   ├── default.conf              # Default Nginx configuration
│   ├── nginx.dev.conf            # Development Nginx config
│   └── nginx.prod.conf           # Production Nginx config
├── php/
│   ├── php.ini                   # PHP development config
│   └── php.prod.ini              # PHP production config (OPcache enabled)
├── redis/
│   └── redis.conf                # Redis configuration
├── scripts/
│   └── backup.sh                 # Automated backup script
└── supervisor/
    └── supervisord.conf          # Supervisor for queue workers
```

---

## 📄 File Descriptions

### MySQL (`mysql/`)

**`my.cnf`**
- Custom MySQL configuration
- Optimized for performance
- Character set: utf8mb4
- Collation: utf8mb4_unicode_ci

### Nginx (`nginx/`)

**`default.conf`**
- Basic Nginx configuration
- Serves static files
- Proxies API requests to Laravel

**`nginx.dev.conf`**
- Development-specific settings
- Debug logging enabled
- CORS configuration for local development

**`nginx.prod.conf`** ✨ NEW
- Production-optimized configuration
- Gzip compression enabled
- Caching headers
- Security headers (X-Frame-Options, CSP, etc.)
- SSL/TLS ready
- Rate limiting
- Load balancing configuration

### PHP (`php/`)

**`php.ini`**
- Development PHP configuration
- Error display enabled
- Large upload sizes
- XDebug ready

**`php.prod.ini`** ✨ NEW
- Production PHP configuration
- OPcache enabled and optimized
- Error display disabled
- Memory limit: 256M
- Upload limit: 20M
- Session stored in Redis
- Security hardening

**OPcache Settings:**
```ini
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0  # Don't check file changes
opcache.revalidate_freq = 0      # Maximum performance
```

### Redis (`redis/`)

**`redis.conf`**
- Redis server configuration
- Persistence settings (RDB + AOF)
- Memory management
- Password protection ready
- Maxmemory policy: allkeys-lru

### Scripts (`scripts/`)

**`backup.sh`** ✨ NEW
- Automated MySQL backup script
- Creates compressed backups (.sql.gz)
- Automatic cleanup of old backups
- Retention period: 30 days (configurable)
- Logs backup size and status

**Usage:**
```bash
# Manual backup
docker-compose exec backup /backup.sh

# Automated (via cron in production)
# Runs daily at 2 AM
```

### Supervisor (`supervisor/`)

**`supervisord.conf`**
- Manages long-running processes
- Queue workers for Laravel
- Automatic restart on failure
- Log management

**Processes:**
- `laravel-queue-worker`: Processes background jobs
- `laravel-scheduler`: Runs scheduled tasks

---

## 🔧 Configuration Best Practices

### Development

1. **Keep error reporting ON**
   - Easy debugging
   - Detailed error messages

2. **Disable caching**
   - See changes immediately
   - No need to clear cache

3. **Enable CORS**
   - Allow cross-origin requests
   - Useful for separate frontend/backend

### Production

1. **Enable OPcache**
   - 3-5x performance improvement
   - Caches compiled PHP code

2. **Use Redis for sessions**
   - Better performance
   - Shared sessions across containers

3. **Enable Gzip compression**
   - Reduces bandwidth
   - Faster page loads

4. **Set security headers**
   - XSS Protection
   - CSRF Protection
   - Content Security Policy

5. **Disable error display**
   - Log errors instead
   - Don't expose sensitive info

---

## 🚀 Quick Reference

### Modify Configuration

1. **Change PHP settings:**
   ```bash
   # Edit file
   nano docker/php/php.prod.ini
   
   # Restart container
   docker-compose restart backend
   ```

2. **Change Nginx settings:**
   ```bash
   # Edit file
   nano docker/nginx/nginx.prod.conf
   
   # Test configuration
   docker-compose exec nginx nginx -t
   
   # Reload
   docker-compose exec nginx nginx -s reload
   ```

3. **Change MySQL settings:**
   ```bash
   # Edit file
   nano docker/mysql/my.cnf
   
   # Restart (WARNING: Will cause downtime)
   docker-compose restart mysql
   ```

### Common Tasks

**View PHP info:**
```bash
docker-compose exec backend php -i
```

**Check OPcache status:**
```bash
docker-compose exec backend php -r "var_dump(opcache_get_status());"
```

**Test Nginx config:**
```bash
docker-compose exec nginx nginx -t
```

**Redis info:**
```bash
docker-compose exec redis redis-cli INFO
```

**MySQL variables:**
```bash
docker-compose exec mysql mysql -u root -p -e "SHOW VARIABLES;"
```

---

## 📊 Performance Tuning

### PHP OPcache

```ini
# More aggressive caching
opcache.memory_consumption = 512     # Increase memory
opcache.max_accelerated_files = 30000  # More files
opcache.validate_timestamps = 0      # Never check timestamps
```

### MySQL

```ini
# Increase buffer pool (InnoDB)
innodb_buffer_pool_size = 2G

# Increase connections
max_connections = 200

# Query cache (for read-heavy loads)
query_cache_size = 64M
```

### Redis

```ini
# Increase max memory
maxmemory 2gb

# Adjust eviction policy
maxmemory-policy allkeys-lru
```

### Nginx

```nginx
# Worker processes (= CPU cores)
worker_processes auto;

# Worker connections
worker_connections 4096;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;
```

---

## 🔒 Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Enable Redis password protection
- [ ] Configure SSL/TLS certificates
- [ ] Set strong MySQL root password
- [ ] Restrict MySQL remote access
- [ ] Enable Nginx rate limiting
- [ ] Set proper file permissions
- [ ] Disable unnecessary PHP functions
- [ ] Enable PHP open_basedir restriction
- [ ] Configure firewall rules

---

## 🆘 Troubleshooting

### PHP Issues

**Problem: OPcache not working**
```bash
# Check if enabled
docker-compose exec backend php -r "var_dump(function_exists('opcache_reset'));"

# Clear OPcache
docker-compose exec backend php artisan opcache:clear
```

**Problem: Memory limit errors**
```ini
# Increase in php.prod.ini
memory_limit = 512M
```

### Nginx Issues

**Problem: 502 Bad Gateway**
```bash
# Check backend is running
docker-compose ps backend

# Check Nginx logs
docker-compose logs nginx

# Test backend directly
curl http://localhost:8000
```

**Problem: 413 Request Entity Too Large**
```nginx
# Increase in nginx.prod.conf
client_max_body_size 50M;
```

### MySQL Issues

**Problem: Too many connections**
```ini
# Increase in my.cnf
max_connections = 500
```

**Problem: Slow queries**
```bash
# Enable slow query log
slow_query_log = 1
long_query_time = 2
```

### Redis Issues

**Problem: Out of memory**
```bash
# Check memory usage
docker-compose exec redis redis-cli INFO memory

# Flush if needed
docker-compose exec redis redis-cli FLUSHALL
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PHP OPcache](https://www.php.net/manual/en/book.opcache.php)
- [MySQL Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Redis Configuration](https://redis.io/docs/manual/config/)

---

**For complete setup instructions, see [DOCKER_SETUP.md](../DOCKER_SETUP.md)**

