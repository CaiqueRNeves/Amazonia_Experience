#!/bin/bash

# Script para implantação do backend AmazôniaExperience em produção

# Garantir que o script pare se ocorrer qualquer erro
set -e

echo "🚀 Iniciando implantação do AmazôniaExperience Backend..."

# Variáveis de ambiente
REPOSITORY_URL="https://github.com/CaiqueRNeves/Amazonia_Experience.git"
DEPLOY_PATH="/opt/amazonia-experience"
BRANCH="main"

# Verificar se o diretório existe, se não, criar
if [ ! -d "$DEPLOY_PATH" ]; then
  echo "📁 Criando diretório de implantação..."
  mkdir -p "$DEPLOY_PATH"
  git clone "$REPOSITORY_URL" "$DEPLOY_PATH"
  cd "$DEPLOY_PATH"
else
  echo "📂 Atualizando código fonte..."
  cd "$DEPLOY_PATH"
  git fetch --all
  git reset --hard origin/$BRANCH
fi

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
  echo "❌ Docker não encontrado. Instalando Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose não encontrado. Instalando Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.16.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Verificar se o arquivo .env de produção existe
if [ ! -f .env ]; then
  echo "⚙️ Configurando variáveis de ambiente de produção..."
  cp .env.example .env
  
  # Gerar segredos aleatórios para JWT
  JWT_SECRET=$(openssl rand -base64 32)
  JWT_REFRESH_SECRET=$(openssl rand -base64 32)
  
  # Configurar variáveis para produção
  sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
  sed -i "s/seu_jwt_secret_key/$JWT_SECRET/" .env
  sed -i "s/seu_refresh_token_secret/$JWT_REFRESH_SECRET/" .env
fi

echo "🐳 Construindo e iniciando containers Docker..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "🧹 Limpando imagens e containers antigos..."
docker system prune -af --volumes

echo "✅ Implantação concluída com sucesso!"
echo "🌐 A API está disponível em: http://localhost:3000/api"
echo "📚 A documentação está disponível em: http://localhost:3000/api-docs"