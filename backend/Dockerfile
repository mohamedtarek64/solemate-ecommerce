# Production Dockerfile for Laravel Backend
FROM php:8.1-fpm-alpine AS builder

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    zip \
    unzip \
    mysql-client

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies (production only)
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy application files
COPY . .

# Generate optimized autoload files
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# Optimize Laravel for production
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Production stage
FROM php:8.1-fpm-alpine

WORKDIR /var/www/html

# Install runtime dependencies only
RUN apk add --no-cache \
    bash \
    mysql-client \
    libpng \
    libzip \
    freetype \
    libjpeg-turbo \
    libwebp \
    supervisor

# Copy PHP extensions from builder
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

# Copy application from builder
COPY --from=builder --chown=www-data:www-data /var/www/html /var/www/html

# Copy production PHP configuration
COPY ./docker/php/php.prod.ini /usr/local/etc/php/conf.d/custom.ini

# Copy supervisor configuration
COPY ./docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD php artisan | grep -q "Laravel" || exit 1

# Expose port
EXPOSE 9000

# Switch to non-root user
USER www-data

# Start supervisor (manages PHP-FPM and queue workers)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]


