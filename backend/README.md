# Backend AmazôniaExperience - COP30 Belém

Este é o backend da plataforma AmazôniaExperience, desenvolvida para a COP30 em Belém do Pará. O sistema permite que visitantes acumulem **AmaCoins** ao participar de eventos oficiais da COP30, visitar pontos turísticos e estabelecimentos credenciados, podendo posteriormente trocar esses créditos por produtos e serviços de parceiros locais.

## Funcionalidades

-  **Autenticação JWT** - Sistema completo de login/registro
-  **Gamificação** - Sistema de AmaCoins e pontuação
-  **Geolocalização** - Eventos e locais próximos
-  **Check-ins** - Sistema de verificação de presença
-  **Quizzes** - Sistema educativo com recompensas
-  **Recompensas** - Marketplace de produtos e serviços
-  **Chatbot** - Assistente virtual com NLP
-  **Conectividade** - Pontos de Wi-Fi e relatórios
-  **Emergência** - Serviços e contatos de emergência
-  **Parceiros** - Sistema de verificação para estabelecimentos

## Tecnologias Utilizadas

- **Node.js 18+** com ES6 Modules
- **Express.js** - Framework web para API RESTful
- **SQLite** - Banco de dados relacional leve (desenvolvimento)
- **Knex.js** - Query builder e sistema de migrations
- **JWT** - Autenticação via JSON Web Tokens
- **bcrypt** - Hash seguro de senhas
- **Swagger** - Documentação da API
- **Jest** - Testes automatizados
- **ESLint** - Linting de código
- **node-nlp** - Processamento de linguagem natural
- **Helmet, Express Rate Limit, Express Validator** - Segurança e validação

## Instalação

1. **Clone o repositório**
```bash
git clone https://https://github.com/CaiqueRNeves/Amazonia_Experience.git
cd amazonia-experience-api
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute as migrations e seeds**
```bash
npm run migrate
npm run seed
```

5. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev
# Produção
npm start
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor com nodemon
npm start           # Inicia servidor em produção

# Banco de dados
npm run migrate     # Executa migrations
npm run migrate:rollback # Desfaz migrations
npm run seed        # Executa seeds

# Testes
npm test           # Executa todos os testes
npm run test:watch # Executa testes em modo watch
npm run test:integration # Apenas testes de integração
npm run test:unit  # Apenas testes unitários

# Qualidade de código
npm run lint       # Verifica código com ESLint
npm run lint:fix   # Corrige automaticamente problemas de lint
```

## Documentação da API

A documentação da API está disponível via Swagger UI:

- **Desenvolvimento**: http://localhost:3000/api-docs
- **JSON Schema**: http://localhost:3000/api-docs.json

## Autenticação

A API utiliza JWT para autenticação. Inclua o token no header:

```http
Authorization: Bearer <seu-jwt-token>
```

### Usuários de teste:

- **Admin**: admin@amazonia-experience.com / admin123
- **Usuário**: maria@example.com / password123
- **Parceiro**: contato@restauranteamazonico.com / partner123

## Estrutura do Projeto

```
backend/
├── src/
│   ├── config/              # Configurações (database, swagger)
│   ├── controllers/         # Controladores da API
│   ├── middleware/          # Middlewares (auth, error, etc)
│   ├── models/              # Modelos de dados
│   ├── routes/              # Definição das rotas
│   ├── services/            # Lógica de negócio
│   ├── utils/               # Utilitários (jwt, logger, etc)
│   ├── validators/          # Validações de entrada
│   ├── app.js              # Configuração do Express
│   └── server.js           # Entrada da aplicação
├── migrations/             # Migrations do banco de dados
├── seeds/                  # Seeds para dados iniciais
├── tests/                  # Testes automatizados
│   ├── integration/        # Testes de integração
│   ├── unit/              # Testes unitários
│   └── setup.js           # Configuração dos testes
├── data/                   # Arquivos do banco SQLite
├── .env.example           # Exemplo de configurações de ambiente
├── knexfile.js            # Configuração do Knex
└── package.json           # Dependências e scripts
```

## Testes

O projeto inclui testes unitários e de integração:

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm run test:unit        # Testes unitários
npm run test:integration # Testes de integração

# Executar com coverage
npm test -- --coverage
```

## Rotas Principais

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/refresh` - Renovar token

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/nearby` - Eventos próximos
- `POST /api/events/checkin` - Check-in em evento

### Locais
- `GET /api/places` - Listar locais
- `GET /api/places/nearby` - Locais próximos
- `POST /api/places/checkin` - Check-in em local

### Quizzes
- `GET /api/quizzes` - Listar quizzes
- `POST /api/quizzes/:id/start` - Iniciar quiz
- `POST /api/quizzes/attempts/:id/submit` - Finalizar quiz

### Recompensas
- `GET /api/rewards` - Listar recompensas
- `POST /api/rewards/:id/redeem` - Resgatar recompensa

## Deploy

### Variáveis de Ambiente de Produção
```bash
NODE_ENV=production
JWT_SECRET=your-production-secret
# ... outras configurações
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### ESLint
```bash
npm run lint:fix
```

### Husky (Git Hooks)
O projeto usa Husky para executar verificações antes de commits:
- Pre-commit: ESLint
- Pre-push: Testes

### Banco de Dados
Durante desenvolvimento, é usado SQLite em arquivo. Para produção, pode ser configurado outro banco via Knex.

## Suporte

Para suporte técnico ou dúvidas:
- Issues: [GitHub Issues](https://https://github.com/CaiqueRNeves/Amazonia_Experience-api/issues)

## Autores

- **Caique Rabelo Neves** - caiquerabelo2015@hotmail.com
- **Lucas Soares dos Santos** - lluquinhas482@gmail.com

---
