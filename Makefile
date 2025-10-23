# Makefile for SoleMate E-Commerce Platform
# Simplifies Docker commands and common operations

.PHONY: help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)SoleMate E-Commerce - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(BLUE)%-20s$(NC) %s\n", $$1, $$2}'

# Development Commands
dev-up: ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose up -d

dev-down: ## Stop development environment
	@echo "$(YELLOW)Stopping development environment...$(NC)"
	docker-compose down

dev-restart: ## Restart development environment
	@echo "$(YELLOW)Restarting development environment...$(NC)"
	docker-compose restart

dev-logs: ## View development logs
	docker-compose logs -f

dev-build: ## Rebuild development containers
	@echo "$(BLUE)Building development containers...$(NC)"
	docker-compose build --no-cache

# Production Commands
prod-up: ## Start production environment
	@echo "$(GREEN)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production environment
	@echo "$(YELLOW)Stopping production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml down

prod-restart: ## Restart production environment
	@echo "$(YELLOW)Restarting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml restart

prod-logs: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

prod-build: ## Build production containers
	@echo "$(BLUE)Building production containers...$(NC)"
	docker-compose -f docker-compose.prod.yml build --no-cache

# Backend Commands
backend-shell: ## Access backend container shell
	docker-compose exec backend bash

backend-logs: ## View backend logs
	docker-compose logs -f backend

backend-test: ## Run backend tests
	docker-compose exec backend php artisan test

backend-migrate: ## Run database migrations
	docker-compose exec backend php artisan migrate

backend-seed: ## Seed database
	docker-compose exec backend php artisan db:seed

backend-fresh: ## Fresh migration with seed
	docker-compose exec backend php artisan migrate:fresh --seed

backend-cache-clear: ## Clear all caches
	@echo "$(YELLOW)Clearing caches...$(NC)"
	docker-compose exec backend php artisan cache:clear
	docker-compose exec backend php artisan config:clear
	docker-compose exec backend php artisan route:clear
	docker-compose exec backend php artisan view:clear

backend-optimize: ## Optimize for production
	@echo "$(GREEN)Optimizing Laravel...$(NC)"
	docker-compose exec backend php artisan config:cache
	docker-compose exec backend php artisan route:cache
	docker-compose exec backend php artisan view:cache
	docker-compose exec backend composer dump-autoload -o

# Frontend Commands
frontend-shell: ## Access frontend container shell
	docker-compose exec frontend sh

frontend-logs: ## View frontend logs
	docker-compose logs -f frontend

frontend-build: ## Build frontend for production
	docker-compose exec frontend npm run build

frontend-lint: ## Run frontend linter
	docker-compose exec frontend npm run lint

# Database Commands
db-shell: ## Access MySQL shell
	docker-compose exec mysql mysql -u dev_user -p

db-backup: ## Backup database
	@echo "$(BLUE)Creating database backup...$(NC)"
	@mkdir -p backup
	docker-compose exec mysql mysqldump -u dev_user -pdev_pass --single-transaction ecommerce_db > backup/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup created successfully!$(NC)"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE parameter$(NC)"; \
		echo "Usage: make db-restore FILE=backup.sql"; \
		exit 1; \
	fi
	docker-compose exec -T mysql mysql -u dev_user -pdev_pass ecommerce_db < $(FILE)
	@echo "$(GREEN)Database restored successfully!$(NC)"

# Redis Commands
redis-shell: ## Access Redis CLI
	docker-compose exec redis redis-cli

redis-flush: ## Flush all Redis data
	@echo "$(RED)Warning: This will delete all Redis data!$(NC)"
	@read -p "Are you sure? [y/N]: " confirm && [ "$$confirm" = "y" ] && \
		docker-compose exec redis redis-cli FLUSHALL && \
		echo "$(GREEN)Redis flushed successfully!$(NC)" || \
		echo "$(YELLOW)Cancelled$(NC)"

# Monitoring Commands
status: ## Check services status
	docker-compose ps

logs-all: ## View all services logs
	docker-compose logs -f

stats: ## View container resource usage
	docker stats

health: ## Check services health
	@echo "$(BLUE)Checking services health...$(NC)"
	@docker-compose ps
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✓ Frontend: OK$(NC)" || echo "$(RED)✗ Frontend: DOWN$(NC)"
	@curl -s http://localhost:8000/api/health > /dev/null && echo "$(GREEN)✓ Backend: OK$(NC)" || echo "$(RED)✗ Backend: DOWN$(NC)"
	@docker-compose exec redis redis-cli ping > /dev/null 2>&1 && echo "$(GREEN)✓ Redis: OK$(NC)" || echo "$(RED)✗ Redis: DOWN$(NC)"
	@docker-compose exec mysql mysqladmin ping -h localhost > /dev/null 2>&1 && echo "$(GREEN)✓ MySQL: OK$(NC)" || echo "$(RED)✗ MySQL: DOWN$(NC)"

# Cleanup Commands
clean: ## Remove all containers and volumes
	@echo "$(RED)Warning: This will remove all containers and volumes!$(NC)"
	@read -p "Are you sure? [y/N]: " confirm && [ "$$confirm" = "y" ] && \
		docker-compose down -v && \
		echo "$(GREEN)Cleanup completed!$(NC)" || \
		echo "$(YELLOW)Cancelled$(NC)"

prune: ## Clean up Docker system
	@echo "$(YELLOW)Cleaning up Docker system...$(NC)"
	docker system prune -af --volumes
	@echo "$(GREEN)Docker system cleaned!$(NC)"

# Installation Commands
install: ## Initial setup and installation
	@echo "$(GREEN)Starting initial installation...$(NC)"
	@if [ ! -f "backend/.env" ]; then \
		cp backend/.env.example backend/.env; \
		echo "$(GREEN)Created backend/.env$(NC)"; \
	fi
	@if [ ! -f "frontend/.env" ]; then \
		cp frontend/.env.example frontend/.env; \
		echo "$(GREEN)Created frontend/.env$(NC)"; \
	fi
	docker-compose up -d
	@echo "$(YELLOW)Waiting for services to start...$(NC)"
	@sleep 10
	docker-compose exec backend composer install
	docker-compose exec backend php artisan key:generate
	docker-compose exec backend php artisan migrate --seed
	docker-compose exec frontend npm install
	@echo "$(GREEN)Installation completed! Access: http://localhost:3000$(NC)"

# Utility Commands
shell: backend-shell ## Alias for backend-shell

artisan: ## Run artisan command (usage: make artisan CMD="migrate")
	@if [ -z "$(CMD)" ]; then \
		echo "$(RED)Error: Please specify CMD parameter$(NC)"; \
		echo "Usage: make artisan CMD=\"migrate\""; \
		exit 1; \
	fi
	docker-compose exec backend php artisan $(CMD)

composer: ## Run composer command (usage: make composer CMD="install")
	@if [ -z "$(CMD)" ]; then \
		echo "$(RED)Error: Please specify CMD parameter$(NC)"; \
		echo "Usage: make composer CMD=\"install\""; \
		exit 1; \
	fi
	docker-compose exec backend composer $(CMD)

npm: ## Run npm command (usage: make npm CMD="install")
	@if [ -z "$(CMD)" ]; then \
		echo "$(RED)Error: Please specify CMD parameter$(NC)"; \
		echo "Usage: make npm CMD=\"install\""; \
		exit 1; \
	fi
	docker-compose exec frontend npm $(CMD)

# Default target
.DEFAULT_GOAL := help

