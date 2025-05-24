#!/bin/bash

# Script para configurar o ambiente de desenvolvimento do projeto AmazôniaExperience

echo "Configurando ambiente de desenvolvimento para AmazôniaExperience..."

# Verifica se o arquivo .env existe
if [ ! -f .env ]; then
  echo "Criando arquivo .env a partir do modelo .env.example..."
  cp .env.example .env
  
  # Gera segredos aleatórios para JWT
  JWT_SECRET=$(openssl rand -base64 32)
  JWT_REFRESH_SECRET=$(openssl rand -base64 32)
  
  # Substitui valores no arquivo .env
  sed -i "s/seu_jwt_secret_key/$JWT_SECRET/" .env
  sed -i "s/seu_refresh_token_secret/$JWT_REFRESH_SECRET/" .env
else
  echo "Arquivo .env já existe, pulando criação..."
fi

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "Node.js não encontrado. Por favor, instale o Node.js 18 ou superior."
  exit 1
fi

# Verifica a versão do Node.js
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt "18" ]; then
  echo "Versão do Node.js muito antiga. Por favor, use a versão 18 ou superior."
  exit 1
fi

# Instala as dependências
echo "Instalando dependências..."
npm ci

# Configura Husky para os hooks do Git
echo "Configurando Husky para hooks do Git..."
npx husky install

# Executa as migrations e seeds
echo "Configurando banco de dados..."
npm run migrate
npm run seed

echo "Ambiente configurado com sucesso! Para iniciar o servidor, execute: npm run dev"