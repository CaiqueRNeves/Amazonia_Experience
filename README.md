# Backend AmazôniaExperience - COP30 Belém

Este é o backend da plataforma AmazôniaExperience, desenvolvida para a COP30 em Belém do Pará. O sistema permite que visitantes acumulem **AmaCoins** ao participar de eventos oficiais da COP30, visitar pontos turísticos e estabelecimentos credenciados, podendo posteriormente trocar esses créditos por produtos e serviços de parceiros locais.

## 🚀 Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript
- **Express.js**: Framework web para API RESTful
- **SQLite**: Banco de dados relacional leve
- **Knex.js**: Query builder e sistema de migrations
- **JWT**: Autenticação via JSON Web Tokens
- **bcrypt**: Hash seguro de senhas
- **Docker**: Containerização da aplicação
- **Jest**: Framework de testes
- **ESLint/Prettier**: Linting e formatação de código
- **Swagger/OpenAPI**: Documentação da API
- **GitHub Actions**: CI/CD pipeline
- **Outras bibliotecas**: Helmet, Express Rate Limit, Express Validator, i18next, etc.


## 📁 Estrutura do Projeto

> **"Conheça Belém, participe dos eventos da COP30 e acumule AmaCoins para experiências únicas na Amazônia"**


```
backend/
├── .github/                        # Configurações do GitHub (Actions para CI/CD)
├── src/
│   ├── config/                     # Configurações da aplicação
│   ├── controllers/                # Controladores da API
│   ├── database/
│   │   ├── migrations/             # Migrations do banco de dados
│   │   └── seeds/                  # Seeds para dados iniciais
│   ├── middleware/                 # Middlewares do Express
│   ├── models/                     # Modelos de dados
│   ├── routes/                     # Rotas da API
│   ├── services/                   # Serviços de negócio
│   ├── utils/                      # Funções utilitárias
│   ├── validators/                 # Validadores de entrada
│   └── app.js                      # Inicialização da aplicação
├── tests/
│   ├── unit/                       # Testes unitários
│   ├── integration/                # Testes de integração
│   └── setup.js                    # Configuração do ambiente de teste
├── .dockerignore                   # Arquivos ignorados no build do Docker
├── .env.example                    # Exemplo de configurações de ambiente
├── .eslintrc.js                    # Configuração do ESLint
├── .prettierrc                     # Configuração do Prettier
├── docker-compose.yml              # Configuração do Docker Compose
├── Dockerfile                      # Instruções para build da imagem Docker
├── jest.config.js                  # Configuração do Jest
├── jest.setup.js                   # Setup para testes
├── knexfile.js                     # Configuração do Knex.js
├── package.json                    # Dependências e scripts
├── setup-env.sh                    # Script de configuração do ambiente
└── server.js                       # Ponto de entrada da aplicação
```

## 🔧 Instalação e Configuração

### Usando NPM (Desenvolvimento Local)

1. **Clone o repositório**

```bash
git clone <repository-url>
cd backend
```

2. **Execute o script de configuração**

```bash
# Tornar o script executável
chmod +x setup-env.sh

# Executar o script
./setup-env.sh
```

O script irá:
- Criar o arquivo .env a partir do .env.example
- Gerar segredos JWT aleatórios
- Instalar as dependências
- Configurar hooks do Git
- Executar migrations e seeds

3. **Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

### Usando Docker (Recomendado)

1. **Clone o repositório**

```bash
git clone <repository-url>
cd backend
```

2. **Construa e inicie os containers**

```bash
# Construir e iniciar todos os serviços
npm run docker:compose:build

# Ou usando Docker Compose diretamente
docker-compose up --build
```

O Docker irá:
- Construir a imagem do backend a partir do Dockerfile
- Configurar o ambiente com as variáveis definidas no docker-compose.yml
- Iniciar o servidor backend e o frontend (se disponível)

## 🧪 Testes

O projeto contém testes unitários e de integração. Para executá-los:

```bash
# Executar todos os testes
npm test

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes de integração
npm run test:integration

# Executar testes com relatório de cobertura
npm run test:coverage
```

## 📊 CI/CD Pipeline

O projeto utiliza GitHub Actions para automação de CI/CD. O pipeline inclui:

1. **Lint**: Verifica a qualidade do código com ESLint
2. **Test**: Executa os testes e gera relatório de cobertura
3. **Build**: Constrói a imagem Docker e a envia para o Docker Hub
4. **Deploy**: Implanta automaticamente nos ambientes de staging (branch `develop`) e produção (branch `main`)

Para usar o CI/CD com seu próprio repositório, configure os seguintes secrets no GitHub:

- `DOCKERHUB_USERNAME`: Seu nome de usuário no Docker Hub
- `DOCKERHUB_TOKEN`: Token de acesso ao Docker Hub
- `STAGING_HOST`, `STAGING_USERNAME`, `STAGING_SSH_KEY`: Dados de acesso ao servidor de staging
- `PRODUCTION_HOST`, `PRODUCTION_USERNAME`, `PRODUCTION_SSH_KEY`: Dados de acesso ao servidor de produção

## 📝 API Documentation

A documentação da API está disponível via Swagger/OpenAPI quando o servidor está em execução:

```
http://localhost:3000/api-docs
```

A documentação inclui:
- Endpoints disponíveis
- Parâmetros de requisição
- Formatos de resposta
- Exemplos de uso
- Autenticação

## 🔒 Autenticação

O sistema utiliza autenticação JWT (JSON Web Token). Para acessar endpoints protegidos, é necessário incluir o token no cabeçalho da requisição:

```
Authorization: Bearer {seu_token_jwt}
```

Você pode obter um token válido através do endpoint de login (`POST /api/auth/login`).

## 📋 Scripts Disponíveis

O projeto contém os seguintes scripts no `package.json`:

- `npm start`: Inicia o servidor em modo de produção
- `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reload
- `npm run migrate`: Executa as migrations do Knex
- `npm run seed`: Executa as seeds do banco de dados
- `npm test`: Executa testes com Jest
- `npm run test:unit`: Executa apenas testes unitários
- `npm run test:integration`: Executa apenas testes de integração
- `npm run test:coverage`: Executa testes com relatório de cobertura
- `npm run lint`: Verifica o código com ESLint
- `npm run lint:fix`: Corrige automaticamente problemas detectados pelo ESLint
- `npm run docker:build`: Constrói a imagem Docker
- `npm run docker:run`: Executa o container Docker
- `npm run docker:compose`: Inicia todos os serviços com Docker Compose
- `npm run docker:compose:build`: Constrói e inicia todos os serviços com Docker Compose
- `npm run prepare-release`: Prepara uma nova versão com standard-version

## 👥 Usuários de Teste

Os seguintes usuários são criados pelos seeds para testes:

| Nome | Email | Senha | Função |
|------|-------|-------|--------|
| Administrador | admin@amazonia-experience.com | admin123 | admin |
| Maria Silva | maria@example.com | password123 | user |
| John Doe | john@example.com | password123 | user |
| Restaurante Amazônico | contato@restauranteamazonico.com | partner123 | partner |
| Artesanato Regional | contato@artesanatoregional.com | partner123 | partner |

## 🌐 Exemplos de Uso da API

### Registro de Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Usuário",
    "email": "usuario@example.com",
    "password": "senha123",
    "nationality": "Brasil"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123"
  }'
```

### Buscar Eventos Próximos

```bash
curl -X GET "http://localhost:3000/api/events/nearby?latitude=-1.4500&longitude=-48.4800&radius=5" \
  -H "Authorization: Bearer {seu_token_jwt}"
```

### Realizar Check-in em um Evento

```bash
curl -X POST http://localhost:3000/api/events/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token_jwt}" \
  -d '{
    "event_id": 1
  }'
```

## 🛠️ Guia de Desenvolvimento

### Boas Práticas

1. **Branches**:
   - `main`: Código estável para produção
   - `develop`: Código para próxima versão (staging)
   - `feature/*`: Novas funcionalidades
   - `bugfix/*`: Correções de bugs
   - `hotfix/*`: Correções urgentes para produção

2. **Commits**:
   - Use commits semânticos (feat, fix, docs, style, refactor, test, chore)
   - Exemplo: `feat: adicionar sistema de notificações`

3. **Pull Requests**:
   - Use o template de PR
   - Aguarde a execução do CI/CD pipeline
   - Obtenha pelo menos uma aprovação antes de fazer o merge

4. **Testes**:
   - Escreva testes para todas as novas funcionalidades
   - Mantenha a cobertura de testes acima de 70%

### Criando novas migrations

```bash
npx knex migrate:make nome_da_migration
```

### Criando novas seeds

```bash
npx knex seed:make nome_da_seed
```

### Adicionando um novo modelo

1. Crie um arquivo para o modelo em `src/models/`
2. Implemente as funções para interagir com o banco de dados
3. Exporte o modelo

### Adicionando um novo controlador

1. Crie um arquivo para o controlador em `src/controllers/`
2. Implemente os métodos de manipulação das requisições
3. Exporte os métodos

### Adicionando novas rotas

1. Crie ou edite o arquivo de rotas em `src/routes/`
2. Importe o controlador correspondente
3. Defina as rotas e associe-as aos métodos do controlador
4. Não esqueça de registrar as novas rotas em `src/app.js`

### Documentação da API

Para documentar novos endpoints, adicione anotações de Swagger no arquivo de rotas correspondente:

```javascript
/**
 * @swagger
 * /path/to/endpoint:
 *   get:
 *     summary: Resumo do endpoint
 *     description: Descrição detalhada
 *     tags: [Categoria]
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *         description: Descrição do parâmetro
 *     responses:
 *       200:
 *         description: Descrição da resposta de sucesso
 */
```
-------------------------------------------------------------------------------------------------------

## 👨‍💻 Autores


- **Caique Rabelo Neves** - caiquerabelo2015@hotmail.com
- **Lucas Soares dos Santos** - lluquinhas482@gmail.com

------------------------------------------------------------------------------------------------------------------

