SHELL := /bin/bash

PROJECT_ROOT := $(shell pwd)
CONTAINER_UID := 1000
ENVIRONMENT ?= development

network-create:
	docker network create trademax > /dev/null 2>&1 || true

command:
	@test -n "$(COMMAND)"
	docker build -f .devcontainer/Dockerfile -t trademax_devcontainer . && \
	docker run -u $(CONTAINER_UID) --rm -v $(PROJECT_ROOT):/trademax trademax_devcontainer sh -c "$(COMMAND)"

exec:
	@test -n "$(PROJECT)"
	@test -n "$(COMMAND)"
	docker exec -u $(CONTAINER_UID) trademax-$(PROJECT)-1 sh -c "$(COMMAND)"

compose-command: network-create
	@test -n "$(PROJECT)"
	@test -n "$(COMMAND)"
	docker compose --profile $(PROJECT):dev -f docker-compose.dev.yml -p trademax up --build -d --wait && \
	make exec PROJECT=$(PROJECT) COMMAND="$(COMMAND)"

compose-up: network-create
	docker compose --profile all -f docker-compose.yml -p trademax up --build -d --wait

compose-down:
	docker compose --profile all -f docker-compose.yml -p trademax down --remove-orphans

compose-dev-up: network-create
	docker compose --profile all:dev -f docker-compose.dev.yml -p trademax up --build -d --wait

compose-dev-down:
	docker compose --profile all:dev -f docker-compose.dev.yml -p trademax down --remove-orphans

install:
	make command COMMAND="npm install"

clean:
	make command COMMAND="npm run clean"

types:
	make command COMMAND="npm run types"

lint:
	make command COMMAND="npm run lint"

lint-fix:
	make command COMMAND="npm run lint:fix"

format-check:
	make command COMMAND="npm run format:fix"

format:
	make command COMMAND="npm run format"

analyze:
	make command COMMAND="npm run analyze"

fix:
	make command COMMAND="npm run fix"

test:
	make command COMMAND="npm run converter:test"

build:
	docker build --progress=plain -f converter/Dockerfile -t converter .
