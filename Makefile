# Configurações para Desenvolvimento

# Iniciar o ambiente de desenvolvimento
start:
	docker-compose up -d

# Parar o ambiente de desenvolvimento
stop:
	docker-compose down

# Reconstruir e iniciar o ambiente de desenvolvimento
restart:
	docker-compose down
	docker-compose up -d --build

# Visualizar logs
logs:
	docker-compose logs -f

# Executar testes
test:
	docker-compose exec backend npm test

# Executar testes de integração
test-integration:
	docker-compose exec backend npm test -- tests/integration

# Executar linting
lint:
	docker-compose exec backend npm run lint

# Acesso a shell do container
shell:
	docker-compose exec backend sh

# Executar migrations
migrate:
	docker-compose exec backend npm run migrate

# Executar seeds
seed:
	docker-compose exec backend npm run seed