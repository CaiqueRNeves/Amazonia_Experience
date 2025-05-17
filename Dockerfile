# Estágio de desenvolvimento - para testes e build
FROM node:18-alpine AS development

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY knexfile.js ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm ci

# Copiar código fonte
COPY . .

# Estágio de testes
FROM development AS test

# Executar linting e testes
RUN npm run lint
RUN npm run test

# Estágio de build para produção
FROM development AS build

# Executar migrations e seeds para preparar o banco de dados
RUN npm run migrate
RUN npm run seed

# Estágio de produção - imagem final otimizada
FROM node:18-alpine AS production

WORKDIR /app

# Definir variáveis de ambiente
ENV NODE_ENV=production

# Copiar apenas arquivos necessários para produção
COPY package*.json ./
COPY knexfile.js ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar código fonte e banco de dados do estágio de build
COPY --from=build /app/src ./src
COPY --from=build /app/server.js ./

# Criar diretório para o banco de dados e definir permissões
RUN mkdir -p ./src/database && \
    chown -R node:node ./src/database

# Usar usuário não-root
USER node

# Verificação de saúde
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Expor porta
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]