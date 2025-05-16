#!/bin/bash

# Este script permite alternar entre os modos de desenvolvimento e produção
# de forma simples, ajustando o docker-compose.yml conforme necessário.

MODE=$1

if [ "$MODE" = "dev" ]; then
    echo "Configurando ambiente para DESENVOLVIMENTO..."
    
    # Altera a configuração do docker-compose.yml para modo de desenvolvimento
    sed -i 's/# build:/build:/g' docker-compose.yml
    sed -i 's/#   context:/  context:/g' docker-compose.yml
    sed -i 's/#   dockerfile:/  dockerfile:/g' docker-compose.yml
    sed -i 's/image:.*/#image: \${DOCKER_REGISTRY:-yourusername}\/amazonia-experience:\${TAG:-latest}/g' docker-compose.yml
    
    # Descomenta os volumes de desenvolvimento
    sed -i 's/# - .\/src:\/app\/src/- .\/src:\/app\/src/g' docker-compose.yml
    sed -i 's/# - .\/tests:\/app\/tests/- .\/tests:\/app\/tests/g' docker-compose.yml
    
    # Descomenta o comando para modo de desenvolvimento
    sed -i 's/# command: npm run dev/command: npm run dev/g' docker-compose.yml
    
    # Configura NODE_ENV para development
    sed -i 's/NODE_ENV=\${NODE_ENV:-production}/NODE_ENV=\${NODE_ENV:-development}/g' docker-compose.yml
    
    echo "Ambiente configurado para DESENVOLVIMENTO. Execute 'docker-compose up --build' para iniciar."
    
elif [ "$MODE" = "prod" ]; then
    echo "Configurando ambiente para PRODUÇÃO..."
    
    # Altera a configuração do docker-compose.yml para modo de produção
    sed -i 's/build:/#build:/g' docker-compose.yml
    sed -i 's/  context:/#   context:/g' docker-compose.yml
    sed -i 's/  dockerfile:/#   dockerfile:/g' docker-compose.yml
    sed -i 's/#image:/image:/g' docker-compose.yml
    
    # Comenta os volumes de desenvolvimento
    sed -i 's/- .\/src:\/app\/src/# - .\/src:\/app\/src/g' docker-compose.yml
    sed -i 's/- .\/tests:\/app\/tests/# - .\/tests:\/app\/tests/g' docker-compose.yml
    
    # Comenta o comando para modo de desenvolvimento
    sed -i 's/command: npm run dev/# command: npm run dev/g' docker-compose.yml
    
    # Configura NODE_ENV para production
    sed -i 's/NODE_ENV=\${NODE_ENV:-development}/NODE_ENV=\${NODE_ENV:-production}/g' docker-compose.yml
    
    echo "Ambiente configurado para PRODUÇÃO. Execute 'docker-compose up' para iniciar."
    
else
    echo "Uso: $0 [dev|prod]"
    echo "  dev  - Configura para ambiente de desenvolvimento"
    echo "  prod - Configura para ambiente de produção"
    exit 1
fi