.PHONY: help install dev db-create db-init db-migrate db-upgrade db-reset seed test test-cov lint clean docker-build docker-up docker-down

help:
	@echo ""
	@echo "HEYLA OS Backend — Available Commands"
	@echo "======================================"
	@echo "  make install       Install Python dependencies"
	@echo "  make dev           Run Flask dev server"
	@echo "  make db-create     Create PostgreSQL database"
	@echo "  make db-init       Initialize Flask-Migrate"
	@echo "  make db-migrate    Generate migration"
	@echo "  make db-upgrade    Apply migrations"
	@echo "  make db-reset      Drop, recreate, migrate, and seed"
	@echo "  make seed          Run seed script"
	@echo "  make test          Run pytest"
	@echo "  make test-cov      Run pytest with coverage report"
	@echo "  make lint          Run flake8 linter"
	@echo "  make clean         Remove .pyc and cache files"
	@echo "  make docker-build  Build Docker image"
	@echo "  make docker-up     Start all services with Docker Compose"
	@echo "  make docker-down   Stop Docker Compose services"
	@echo ""

install:
	pip install -r requirements.txt

dev:
	flask run --debug

db-create:
	psql -U postgres -c "CREATE DATABASE heyla_os;" || true

db-init:
	flask db init

db-migrate:
	flask db migrate -m "$(msg)"

db-upgrade:
	flask db upgrade

db-reset:
	psql -U postgres -c "DROP DATABASE IF EXISTS heyla_os;" || true
	psql -U postgres -c "CREATE DATABASE heyla_os;"
	flask db upgrade
	python seed.py

seed:
	python seed.py

test:
	pytest

test-cov:
	pytest --cov=app tests/ --cov-report=term-missing --cov-report=html
	@echo "Coverage report saved to htmlcov/index.html"

lint:
	flake8 app/ tests/ --max-line-length=120 --exclude=migrations

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -name ".coverage" -delete 2>/dev/null || true

docker-build:
	docker build -t heyla-os-backend .

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

docker-down-v:
	docker-compose down -v
