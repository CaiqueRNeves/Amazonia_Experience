# Backend AmazôniaExperience - COP30 Belém

Este é o backend da plataforma AmazôniaExperience, desenvolvida para a COP30 em Belém do Pará. O sistema permite que visitantes acumulem **AmaCoins** ao participar de eventos oficiais da COP30, visitar pontos turísticos e estabelecimentos credenciados, podendo posteriormente trocar esses créditos por produtos e serviços de parceiros locais.

## 🚀 Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript
- **Express.js**: Framework web para API RESTful
- **SQLite**: Banco de dados relacional leve
- **Knex.js**: Query builder e sistema de migrations
- **JWT**: Autenticação via JSON Web Tokens
- **bcrypt**: Hash seguro de senhas
- **Outras bibliotecas**: Helmet, Express Rate Limit, Express Validator, i18next, etc.

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/              # Configurações da aplicação
│   ├── controllers/         # Controladores da API
│   ├── database/
│   │   ├── migrations/      # Migrations do banco de dados
│   │   └── seeds/           # Seeds para dados iniciais
│   ├── middleware/          # Middlewares do Express
│   ├── models/              # Modelos de dados
│   ├── routes/              # Rotas da API
│   ├── services/            # Serviços de negócio
│   ├── utils/               # Funções utilitárias
│   ├── validators/          # Validadores de entrada
│   └── app.js               # Inicialização da aplicação
├── tests/                   # Testes automatizados
├── .env.example             # Exemplo de configurações de ambiente
└── server.js                # Ponto de entrada da aplicação
```

## 🔧 Instalação e Configuração

1. **Clone o repositório**

```bash
git clone <repository-url>
cd backend
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações específicas.

4. **Execute as migrations**

```bash
npm run migrate
```

5. **Popule o banco de dados com dados iniciais**

```bash
npm run seed
```

## 🚀 Executando o Servidor

**Modo de desenvolvimento**

```bash
npm run dev
```

**Modo de produção**

```bash
npm start
```

Por padrão, o servidor será executado na porta 3000. Você pode acessar a API em [http://localhost:3000](http://localhost:3000).

## 📝 API Endpoints

A API está organizada nos seguintes grupos principais:

### Autenticação

- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/refresh` - Atualizar token de acesso

### Usuários

- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/amacoins` - Saldo de AmaCoins
- `GET /api/users/visits` - Histórico de visitas
- `PUT /api/users/notification-preferences` - Atualizar preferências de notificação

### Eventos

- `GET /api/events` - Listar eventos
- `GET /api/events/:id` - Detalhes de um evento
- `GET /api/events/nearby` - Eventos próximos (geolocalização)
- `POST /api/events/checkin` - Realizar check-in em um evento

### Locais

- `GET /api/places` - Listar locais
- `GET /api/places/:id` - Detalhes de um local
- `GET /api/places/nearby` - Locais próximos (geolocalização)
- `POST /api/places/checkin` - Realizar check-in em um local

### Parceiros

- `GET /api/partners` - Listar parceiros
- `GET /api/partners/:id/rewards` - Recompensas de um parceiro
- `POST /api/partners/verify-code` - Verificar código de visita (parceiros)

### Recompensas

- `GET /api/rewards` - Listar recompensas
- `GET /api/rewards/physical` - Listar produtos físicos
- `GET /api/rewards/digital` - Listar serviços e descontos digitais
- `GET /api/rewards/:id` - Detalhes de uma recompensa
- `POST /api/rewards/:id/redeem` - Resgatar uma recompensa
- `GET /api/rewards/redemptions` - Histórico de resgates do usuário

### Quizzes

- `GET /api/quizzes` - Listar quizzes disponíveis
- `GET /api/quizzes/:id` - Obter detalhes e perguntas de um quiz
- `POST /api/quizzes/:id/start` - Iniciar tentativa de um quiz
- `POST /api/quizzes/attempts/:attempt_id/answer` - Responder pergunta de quiz
- `POST /api/quizzes/attempts/:attempt_id/submit` - Finalizar tentativa de quiz
- `GET /api/quizzes/attempts` - Histórico de quizzes realizados pelo usuário
- `GET /api/quizzes/leaderboard` - Ranking de usuários em quizzes

### Chatbot

- `POST /api/chat/message` - Enviar mensagem para o chatbot
- `GET /api/chat/history` - Obter histórico de conversas
- `GET /api/chat/context/:entity_type/:entity_id` - Obter informações contextuais para um local ou evento
- `POST /api/chat/feedback` - Enviar feedback sobre resposta do chatbot

### Conectividade

- `GET /api/connectivity/spots` - Listar pontos de conectividade Wi-Fi
- `GET /api/connectivity/spots/nearby` - Encontrar pontos de conectividade próximos
- `POST /api/connectivity/spots/:id/report` - Reportar informação sobre ponto de conectividade
- `GET /api/connectivity/heatmap` - Obter mapa de calor de qualidade de sinal

### Serviços de Emergência

- `GET /api/emergency/services` - Listar serviços de emergência
- `GET /api/emergency/services/:type` - Filtrar serviços por tipo
- `GET /api/emergency/services/nearby` - Encontrar serviços de emergência próximos
- `GET /api/emergency/contacts/:language` - Obter contatos de emergência por idioma
- `GET /api/emergency/phrases/:language` - Frases de emergência úteis em um idioma específico

### Admin

- `POST /api/admin/places` - Criar local (admin)
- `PUT /api/admin/places/:id` - Atualizar local (admin)
- `POST /api/admin/partners` - Criar parceiro (admin)
- `PUT /api/admin/users/:id/role` - Alterar função de usuário (admin)
- `POST /api/admin/quizzes` - Criar novo quiz (admin)
- `PUT /api/admin/quizzes/:id` - Atualizar quiz existente (admin)
- `POST /api/admin/emergency/services` - Adicionar serviço de emergência (admin)
- `PUT /api/admin/connectivity/spots` - Atualizar informações de pontos de conectividade (admin)

## 🧪 Testes

Para executar os testes automatizados:

```bash
npm test
```

## 🔒 Autenticação

O sistema utiliza autenticação JWT (JSON Web Token). Para acessar endpoints protegidos, é necessário incluir o token no cabeçalho da requisição:

```
Authorization: Bearer {seu_token_jwt}
```

Você pode obter um token válido através do endpoint de login (`POST /api/auth/login`).

## 👥 Usuários de Teste

Os seguintes usuários são criados pelos seeds para testes:

| Nome | Email | Senha | Função |
|------|-------|-------|--------|
| Administrador | admin@amazonia-experience.com | admin123 | admin |
| Maria Silva | maria@example.com | password123 | user |
| John Doe | john@example.com | password123 | user |
| Restaurante Amazônico | contato@restauranteamazonico.com | partner123 | partner |
| Artesanato Regional | contato@artesanatoregional.com | partner123 | partner |

## 🛠️ Guia de Desenvolvimento

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

## 📋 Padrões de Código

- Utilize async/await para operações assíncronas
- Utilize try/catch para tratamento de erros
- Siga os padrões RESTful para endpoints da API
- Valide todas as entradas do usuário
- Utilize middleware de autenticação para proteger rotas que requerem login


Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Autores

- **Caique Rabelo Neves** - caiquerabelo2015@hotmail.com
- **Lucas Soares dos Santos** - lluquinhas482@gmail.com