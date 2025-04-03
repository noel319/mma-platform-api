.PHONY: build run test lint clean

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER = docker

# Default target
all: build run

# Build the Docker containers
build:
	$(DOCKER_COMPOSE) build

# Run the Docker containers
run:
	$(DOCKER_COMPOSE) up -d

# Stop the Docker containers
stop:
	$(DOCKER_COMPOSE) down

# Run tests
test:
	$(DOCKER_COMPOSE) exec api npm run test

# Run linting
lint:
	$(DOCKER_COMPOSE) exec api npm run lint

# Run database migrations
migrate:
	$(DOCKER_COMPOSE) exec api npm run typeorm migration:run

# Generate a new migration
migration-generate:
	$(DOCKER_COMPOSE) exec api npm run typeorm migration:generate -- -n $(name)

# Revert the last migration
migration-revert:
	$(DOCKER_COMPOSE) exec api npm run typeorm migration:revert

# View logs
logs:
	$(DOCKER_COMPOSE) logs -f

# Clean up
clean:
	$(DOCKER_COMPOSE) down -v
	rm -rf node_modules
	rm -rf dist

# Seed the database with initial data
seed:
	$(DOCKER_COMPOSE) exec api npm run seed

# Show all container status
status:
	$(DOCKER_COMPOSE) ps

# Enter PostgreSQL command line
psql:
	$(DOCKER_COMPOSE) exec postgres psql -U postgres -d mma_platform

# Initialize the database with schema
init-db:
	cat init.sql | $(DOCKER_COMPOSE) exec -T postgres psql -U postgres -d mma_platform

# init.sql (this will be executed when PostgreSQL container starts)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- This file will contain the SQL schema we created earlier
-- It's initializing the database when the PostgreSQL container starts
-- You need to copy the SQL schema here