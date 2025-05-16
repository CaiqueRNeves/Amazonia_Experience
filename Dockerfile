# Estágio de construção para testes
FROM node:18-alpine AS test

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências, incluindo as de desenvolvimento
RUN npm ci

# Copiar arquivos do projeto
COPY . .

# Comando padrão para executar testes
CMD ["npm", "test"]

# Estágio de construção para produção
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências para build
RUN npm ci

# Copiar arquivos do projeto
COPY . .

# Executar build se necessário (descomente se tiver um script de build)
# RUN npm run build

# Estágio final de produção
FROM node:18-alpine AS production

# Configurar para produção
ENV NODE_ENV=production

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar arquivos do projeto do estágio de build (se tiver build)
# COPY --from=build /app/dist ./dist
# ou copiar diretamente os arquivos necessários
COPY --from=build /app ./

# Criar diretório para o banco de dados SQLite e definir permissões
RUN mkdir -p /app/src/database && \
    chmod -R 755 /app/src/database

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]