# Documentação Técnica - AmazôniaExperience 

**Autores:** Caique Rabelo Neves e Lucas Soares dos Santos  
**Contato:** caiquerabelo2015@hotmail.com / lluquinhas482@gmail.com 
**Última atualização:** Maio/2025  
**Versão:** 0.1.0 (MVP)

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
   - [2.1 Frontend](#21-frontend)
   - [2.2 Backend](#22-backend)
   - [2.3 Comunicação entre Camadas](#23-comunicação-entre-camadas)
3. [Tecnologias](#3-tecnologias)
4. [Estrutura do Projeto](#4-estrutura-do-projeto)
5. [Modelos de Dados](#5-modelos-de-dados)
6. [API Endpoints](#6-api-endpoints)
7. [Autenticação e Autorização](#7-autenticação-e-autorização)
8. [Sistema de Créditos e Eventos da COP30 (continuação)](#8-sistema-de-créditos-e-eventos-da-cop30-continuação)
9. [Recursos Especiais](#9-recursos-especiais)
10. [Configuração de Ambiente](#10-configuração-de-ambiente)
11. [Guia de Desenvolvimento](#11-guia-de-desenvolvimento)
12. [Roadmap](#12-roadmap)
13. [Segurança e Conformidade](#13-segurança-e-conformidade)


## 1. Visão Geral

AmazôniaExperience é uma plataforma desenvolvida para a COP30 em Belém do Pará, focada no público estudantil e acadêmico internacional. O sistema permite que visitantes acumulem **AmaCoins** (moeda virtual do sistema) ao participar de eventos oficiais da COP30, visitar pontos turísticos e estabelecimentos credenciados, podendo posteriormente trocar esses **AmaCoins** por produtos e serviços de parceiros locais.

A plataforma está integrada com a agenda oficial da COP30, destacando eventos prioritários que concedem maiores quantidades de **AmaCoins** aos participantes, incentivando a participação ativa na conferência além da exploração turística da região.

### 1.1 Objetivos do MVP

- Implementar sistema básico de registro e autenticação de usuários
- Desenvolver mecanismo de check-in em eventos da COP30 e locais turísticos
- Criar sistema de acúmulo e troca de **AmaCoins**, com pontuações diferenciadas para eventos oficiais
- Estabelecer perfis de usuário com histórico de visitas e participações
- Configurar painel administrativo para parceiros locais e organizadores de eventos
- Oferecer recursos de conteúdo educativo e informativo através de quizzes temáticos
- Proporcionar assistência contextual via chatbot e alertas de eventos
- Fornecer mapas de conectividade e guia de emergência multilíngue para melhorar a experiência dos visitantes internacionais

## 2. Arquitetura

O projeto adota uma arquitetura cliente-servidor claramente dividida entre frontend e backend:

### 2.1 Frontend

- **Tecnologia Base**: HTML5, CSS3, JavaScript puro
- **Responsabilidade**: Interface de usuário, experiência interativa
- **Componentes Principais**:
  - **Páginas de Autenticação**: Registro e login de usuários
  - **Dashboard do Usuário**: Visualização de créditos e histórico
  - **Mapa Interativo**: Exibição de eventos da COP30 e pontos turísticos
  - **Catálogo de Recompensas**: Produtos e serviços para troca
  - **Perfil do Usuário**: Gerenciamento de informações pessoais
  - **Verificador de Códigos**: Para validação de visitas e participações
  - **Chatbot Interface**: Sistema de conversação contextual
  - **Quiz Center**: Central de quizzes temáticos
  - **Mapas Especiais**: Conectividade Wi-Fi e serviços de emergência
  - **Guia de Emergência**: Informações em múltiplos idiomas

### 2.2 Backend

- **Tecnologia Base**: Node.js com Express.js
- **Responsabilidade**: Lógica de negócios, persistência de dados, autenticação
- **Componentes Principais**:
  - **API RESTful**: Endpoints para todas as operações do sistema
  - **Camada de Serviços**: Implementação da lógica de negócios
  - **Camada de Acesso a Dados**: Interação com o banco SQLite
  - **Sistema de Autenticação**: Baseado em JWT
  - **Gerenciamento de Eventos**: Integração com a agenda da COP30
  - **Processador de Créditos**: Cálculo e atribuição de pontuações
  - **Motor de Chatbot**: Processamento de consultas e geração de respostas
  - **Sistema de Quizzes**: Gerenciamento de perguntas e respostas
  - **Serviço de Alertas**: Notificações contextuais e baseadas em localização

### 2.3 Comunicação entre Camadas

- Frontend se comunica com Backend via requisições HTTP/HTTPS
- Todas as requisições autenticadas utilizam tokens JWT
- Respostas são formatadas em JSON
- Comunicação assíncrona para operações não-bloqueantes
- WebSockets para chatbot e alertas em tempo real

```
+----------------+            +----------------+            +----------------+
|                |  HTTP/JSON |                |   SQL      |                |
|    FRONTEND    |<---------->|    BACKEND    |<---------->|  DATABASE      |
|                |   REST API |                |   (SQLite) |                |
+----------------+            +----------------+            +----------------+
      |                             |
      |                             |
      v                             v
+----------------+            +----------------+
|  USER BROWSER  |            |  EVENT DATA    |
|                |            |  COP30 API     |
+----------------+            +----------------+
```

## 3. Tecnologias

### 3.1 Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express.js**: Framework web para API RESTful
- **SQLite**: Banco de dados relacional leve
- **Knex.js**: Query builder e sistema de migrations
- **JWT**: JSON Web Tokens para autenticação
- **Bcrypt**: Hash de senhas
- **Helmet**: Middleware para segurança de cabeçalhos HTTP
- **Express-rate-limit**: Proteção contra ataques de força bruta
- **Cors**: Middleware para configuração de CORS
- **Dotenv**: Gerenciamento de variáveis de ambiente
- **Joi**: Validação de dados
- **Express-validator**: Sanitização de entradas
- **Axios**: Cliente HTTP para integração com APIs externas (agenda COP30)
- **i18next**: Internacionalização do backend
- **Socket.io**: Comunicação em tempo real para chatbot e alertas
- **node-nlp**: Processamento de linguagem natural para chatbot
- **Nodemailer**: Envio de emails para alertas importantes

### 3.2 Frontend
- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização e layout responsivo
- **JavaScript**: Interatividade e comunicação com a API
- **Service Workers**: Suporte a funcionalidades offline via PWA
- **Workbox**: Biblioteca para implementação de PWA
- **IndexedDB**: Armazenamento de dados offline
- **i18next**: Framework de internacionalização
- **Bootstrap**: Framework CSS para UI responsiva 
- **Leaflet.js**: Biblioteca para mapas interativos
- **Chart.js**: Visualização de dados para estatísticas e quizzes
- **Socket.io-client**: Cliente para comunicação em tempo real
- **SpeechSynthesis API**: Suporte a leitura de texto para acessibilidade

### 3.3 Segurança
- **Helmet.js**: Proteção de cabeçalhos HTTP
- **CSRF Protection**: Proteção contra ataques Cross-Site Request Forgery
- **Content Security Policy**: Mitigação de XSS
- **SQLite Parameters**: Prevenção contra injeção SQL
- **Rate Limiting**: Proteção contra ataques de força bruta
- **JWT com rotação de tokens**: Implementação segura de autenticação

### 3.4 DevOps
- **Git**: Controle de versão
- **ESLint/Prettier**: Linting e formatação de código
- **Jest**: Framework de testes
- **OWASP Dependency Check**: Verificação de vulnerabilidades
- **SonarQube**: Análise estática de código
- **PM2**: Gerenciador de processos para produção

## 4. Estrutura do Projeto

```
amazonia-experience/
├── frontend/                # Código do cliente
│   ├── public/              # Recursos estáticos
│   │   ├── css/             # Estilos CSS
│   │   ├── js/              # Scripts JavaScript
│   │   ├── images/          # Imagens
│   │   ├── quizzes/         # Arquivos JSON de quizzes temáticos
│   │   ├── locales/         # Arquivos de internacionalização
│   │   ├── emergency/       # Dados de contatos de emergência
│   │   ├── connectivity/    # Dados de mapa de conectividade
│   │   └── index.html       # Página principal
│   └── src/                 # Código fonte frontend
│       ├── components/      # Componentes JS reutilizáveis
│       ├── pages/           # Páginas da aplicação
│       │   ├── profile/     # Perfil do usuário
│       │   ├── maps/        # Mapas (eventos, conectividade, etc)
│       │   ├── quizzes/     # Sistema de quizzes temáticos
│       │   ├── chat/        # Interface do chatbot
│       │   ├── emergency/   # Guia de emergência
│       │   └── rewards/     # Sistema de recompensas
│       ├── services/        # Serviços de API
│       └── utils/           # Funções utilitárias
│   
├── backend/                 # Código do servidor
│   ├── src/
│   │   ├── config/          # Configurações da aplicação
│   │   ├── controllers/     # Controladores da API
│   │   ├── database/
│   │   │   ├── migrations/  # Migrations do banco de dados
│   │   │   └── seeds/       # Seeds para dados iniciais
│   │   ├── middleware/      # Middlewares do Express
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços de negócio
│   │   │   ├── chatbot/     # Lógica do chatbot e alertas
│   │   │   ├── quiz/        # Motor de quizzes
│   │   │   ├── maps/        # Serviços de mapas especiais
│   │   │   └── emergency/   # Serviços de emergência
│   │   ├── utils/           # Funções utilitárias
│   │   ├── validators/      # Validadores de entrada
│   │   └── app.js           # Inicialização da aplicação
│   ├── tests/               # Testes automatizados
│   └── .env.example         # Exemplo de configurações de ambiente
│
├── .eslintrc.js             # Configuração do ESLint
├── .gitignore               # Arquivos ignorados pelo Git
├── knexfile.js              # Configuração do Knex
├── LICENSE                  # Licença do projeto
├── package.json             # Dependências e scripts
└── README.md                # Documentação básica
```

## 5. Modelos de Dados

### 5.1 Users (Usuários)
```
{
  id: INTEGER PRIMARY KEY,
  name: STRING,
  email: STRING UNIQUE,
  password: STRING,
  role: ENUM ['user', 'partner', 'admin'],
  nationality: STRING,
  amacoins: INTEGER DEFAULT 0,
  quiz_points: INTEGER DEFAULT 0,
  notification_preferences: JSON,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.2 Events (Eventos)
```
{
  id: INTEGER PRIMARY KEY,
  name: STRING,
  description: TEXT,
  location: STRING,
  latitude: FLOAT,
  longitude: FLOAT,
  start_time: TIMESTAMP,
  end_time: TIMESTAMP,
  event_type: ENUM ['cop30_official', 'cop30_side', 'local_cultural', 'other'],
  amacoins_value: INTEGER,
  is_featured: BOOLEAN,
  max_capacity: INTEGER,
  current_attendance: INTEGER,
  contextual_info: TEXT,
  wifi_available: BOOLEAN,
  wifi_password: STRING NULLABLE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.3 Places (Locais Turísticos)
```
{
  id: INTEGER PRIMARY KEY,
  name: STRING,
  description: TEXT,
  address: STRING,
  latitude: FLOAT,
  longitude: FLOAT,
  type: ENUM ['tourist_spot', 'restaurant', 'shop', 'cultural_venue'],
  amacoins_value: INTEGER,
  partner_id: INTEGER FOREIGN KEY,
  opening_hours: STRING,
  contextual_info: TEXT,
  wifi_available: BOOLEAN,
  wifi_speed: ENUM ['slow', 'medium', 'fast'] NULLABLE,
  wifi_password: STRING NULLABLE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.4 Visits (Visitas/Participações)
```
{
  id: INTEGER PRIMARY KEY,
  user_id: INTEGER FOREIGN KEY,
  place_id: INTEGER FOREIGN KEY NULLABLE,
  event_id: INTEGER FOREIGN KEY NULLABLE,
  amacoins_earned: INTEGER,
  visited_at: TIMESTAMP,
  verification_code: STRING,
  status: ENUM ['pending', 'verified', 'rejected'],
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.5 Rewards (Recompensas)
```
{
  id: INTEGER PRIMARY KEY,
  name: STRING,
  description: TEXT,
  amacoins_cost: INTEGER,
  partner_id: INTEGER FOREIGN KEY,
  reward_type: ENUM ['physical_product', 'digital_service', 'discount_coupon', 'experience'],
  stock: INTEGER,
  image_url: STRING,
  redemption_code: STRING NULLABLE,
  discount_percentage: INTEGER NULLABLE,
  app_integration_data: JSON NULLABLE,
  expiration_date: TIMESTAMP NULLABLE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.6 Redemptions (Resgates)
```
{
  id: INTEGER PRIMARY KEY,
  user_id: INTEGER FOREIGN KEY,
  reward_id: INTEGER FOREIGN KEY,
  amacoins_spent: INTEGER,
  redeemed_at: TIMESTAMP,
  status: ENUM ['pending', 'completed', 'cancelled'],
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.7 Partners (Parceiros)
```
{
  id: INTEGER PRIMARY KEY,
  user_id: INTEGER FOREIGN KEY,
  business_name: STRING,
  business_type: ENUM ['event_organizer', 'tourist_spot', 'shop', 'restaurant', 'app_service'],
  address: STRING,
  contact_phone: STRING,
  website: STRING,
  integration_api_key: STRING NULLABLE,
  offers_digital_products: BOOLEAN DEFAULT FALSE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.8 Quizzes (Quizzes Temáticos)
```
{
  id: INTEGER PRIMARY KEY,
  title: STRING,
  description: TEXT,
  difficulty: ENUM ['easy', 'medium', 'hard'],
  topic: STRING,
  questions_count: INTEGER,
  amacoins_reward: INTEGER,
  available_from: TIMESTAMP,
  available_until: TIMESTAMP,
  is_active: BOOLEAN DEFAULT TRUE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.9 Quiz_Questions (Perguntas de Quiz)
```
{
  id: INTEGER PRIMARY KEY,
  quiz_id: INTEGER FOREIGN KEY,
  question_text: TEXT,
  question_type: ENUM ['multiple_choice', 'true_false', 'open_ended'],
  options: JSON NULLABLE,
  correct_answer: STRING,
  explanation: TEXT NULLABLE,
  points: INTEGER DEFAULT 1,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.10 Quiz_Attempts (Tentativas de Quiz)
```
{
  id: INTEGER PRIMARY KEY,
  user_id: INTEGER FOREIGN KEY,
  quiz_id: INTEGER FOREIGN KEY,
  score: INTEGER,
  completed: BOOLEAN DEFAULT FALSE,
  amacoins_earned: INTEGER,
  started_at: TIMESTAMP,
  completed_at: TIMESTAMP NULLABLE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.11 Connectivity_Spots (Pontos de Conectividade)
```
{
  id: INTEGER PRIMARY KEY,
  name: STRING,
  location_type: ENUM ['public', 'cafe', 'hotel', 'event_venue', 'other'],
  address: STRING,
  latitude: FLOAT,
  longitude: FLOAT,
  wifi_available: BOOLEAN DEFAULT TRUE,
  wifi_speed: ENUM ['slow', 'medium', 'fast'],
  wifi_reliability: INTEGER, // 1-10 rating
  is_free: BOOLEAN,
  password_required: BOOLEAN,
  password_info: STRING NULLABLE,
  opening_hours: STRING,
  additional_info: TEXT NULLABLE,
  verified: BOOLEAN DEFAULT FALSE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.12 Emergency_Services (Serviços de Emergência)
```
{
  id: INTEGER PRIMARY KEY,
  name: STRING,
  service_type: ENUM ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police'],
  address: STRING,
  latitude: FLOAT,
  longitude: FLOAT,
  phone_number: STRING,
  alternative_phone: STRING NULLABLE,
  opening_hours: STRING,
  is_24h: BOOLEAN,
  languages_spoken: JSON, // Array de idiomas disponíveis
  additional_info: TEXT NULLABLE,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 5.13 Chat_Messages (Mensagens do Chatbot)
```
{
  id: INTEGER PRIMARY KEY,
  user_id: INTEGER FOREIGN KEY,
  message: TEXT,
  is_from_user: BOOLEAN,
  context_type: ENUM ['general', 'event', 'place', 'emergency', 'connectivity'] NULLABLE,
  context_id: INTEGER NULLABLE,
  created_at: TIMESTAMP
}
```

### 5.14 User_Alerts (Alertas para Usuários)
```
{
  id: INTEGER PRIMARY KEY,
  user_id: INTEGER FOREIGN KEY,
  alert_type: ENUM ['event_reminder', 'quiz_available', 'system_notification', 'emergency_alert'],
  title: STRING,
  message: TEXT,
  related_entity_type: STRING NULLABLE,
  related_entity_id: INTEGER NULLABLE,
  is_read: BOOLEAN DEFAULT FALSE,
  scheduled_for: TIMESTAMP,
  expires_at: TIMESTAMP,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

## 6. API Endpoints

### 6.1 Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login de usuário
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/refresh` - Atualizar token de acesso

### 6.2 Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/amacoins` - Saldo de AmaCoins
- `GET /api/users/visits` - Histórico de visitas
- `PUT /api/users/notification-preferences` - Atualizar preferências de notificação

### 6.3 Locais
- `GET /api/places` - Listar locais
- `GET /api/places/:id` - Detalhes de um local
- `GET /api/places/nearby` - Locais próximos (geolocalização)
- `POST /api/places/checkin` - Realizar check-in em um local

### 6.4 Parceiros
- `GET /api/partners` - Listar parceiros
- `GET /api/partners/:id/rewards` - Recompensas de um parceiro
- `POST /api/partners/verify-code` - Verificar código de visita (parceiros)

### 6.5 Recompensas
- `GET /api/rewards` - Listar recompensas
- `GET /api/rewards/physical` - Listar produtos físicos
- `GET /api/rewards/digital` - Listar serviços e descontos digitais
- `GET /api/rewards/:id` - Detalhes de uma recompensa
- `POST /api/rewards/:id/redeem` - Resgatar uma recompensa
- `GET /api/rewards/redemptions` - Histórico de resgates do usuário
- `GET /api/rewards/app-integrations` - Listar aplicativos parceiros integrados

### 6.6 Integrações com Aplicativos
- `GET /api/integrations` - Listar aplicativos parceiros disponíveis
- `POST /api/integrations/:app_id/activate` - Ativar benefício em aplicativo parceiro
- `GET /api/integrations/:app_id/status` - Verificar status da integração
- `GET /api/integrations/:app_id/available-rewards` - Listar benefícios disponíveis por aplicativo

### 6.7 Quizzes Temáticos
- `GET /api/quizzes` - Listar quizzes disponíveis
- `GET /api/quizzes/:id` - Obter detalhes e perguntas de um quiz
- `POST /api/quizzes/:id/start` - Iniciar tentativa de um quiz
- `POST /api/quizzes/attempts/:attempt_id/answer` - Responder pergunta de quiz
- `POST /api/quizzes/attempts/:attempt_id/submit` - Finalizar tentativa de quiz
- `GET /api/quizzes/attempts` - Histórico de quizzes realizados pelo usuário
- `GET /api/quizzes/leaderboard` - Ranking de usuários em quizzes

### 6.8 Chatbot
- `POST /api/chat/message` - Enviar mensagem para o chatbot
- `GET /api/chat/history` - Obter histórico de conversas
- `GET /api/chat/context/:entity_type/:entity_id` - Obter informações contextuais para um local ou evento
- `POST /api/chat/feedback` - Enviar feedback sobre resposta do chatbot

### 6.9 Alertas e Notificações
- `GET /api/alerts` - Listar alertas do usuário
- `PUT /api/alerts/:id/read` - Marcar alerta como lido
- `PUT /api/alerts/preferences` - Configurar preferências de alertas
- `GET /api/alerts/upcoming-events` - Listar próximos eventos recomendados

### 6.10 Conectividade
- `GET /api/connectivity/spots` - Listar pontos de conectividade Wi-Fi
- `GET /api/connectivity/spots/nearby` - Encontrar pontos de conectividade próximos
- `POST /api/connectivity/spots/:id/report` - Reportar informação sobre ponto de conectividade
- `GET /api/connectivity/heatmap` - Obter mapa de calor de qualidade de sinal

### 6.11 Serviços de Emergência
- `GET /api/emergency/services` - Listar serviços de emergência
- `GET /api/emergency/services/:type` - Filtrar serviços por tipo
- `GET /api/emergency/services/nearby` - Encontrar serviços de emergência próximos
- `GET /api/emergency/contacts/:language` - Obter contatos de emergência por idioma
- `GET /api/emergency/phrases/:language` - Frases de emergência úteis em um idioma específico

### 6.12 Admin
- `POST /api/admin/places` - Criar local (admin)
- `PUT /api/admin/places/:id` - Atualizar local (admin)
- `POST /api/admin/partners` - Criar parceiro (admin)
- `PUT /api/admin/users/:id/role` - Alterar função de usuário (admin)
- `POST /api/admin/app-integrations` - Configurar nova integração com aplicativo (admin)
- `POST /api/admin/quizzes` - Criar novo quiz (admin)
- `PUT /api/admin/quizzes/:id` - Atualizar quiz existente (admin)
- `POST /api/admin/emergency/services` - Adicionar serviço de emergência (admin)
- `PUT /api/admin/connectivity/spots` - Atualizar informações de pontos de conectividade (admin)

## 7. Autenticação e Autorização
---
### 7.1 Fluxo de Autenticação
1. Usuário se registra ou faz login
2. Servidor valida credenciais e emite token JWT
3. Cliente armazena token (localStorage)
4. Requisições subsequentes incluem token no header Authorization
5. Servidor valida token em cada requisição protegida

### 7.2 Estrutura do Token
```javascript
{
  "id": "user_id",
  "email": "user_email",
  "role": "user_role",
  "iat": issued_at_timestamp,
  "exp": expiration_timestamp
}
```

### 7.3 Middleware de Autenticação
```javascript
// Exemplo de middleware de autenticação
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
};
```

### 7.4 Níveis de Acesso
- **user**: Usuário regular (visitantes)
- **partner**: Parceiros comerciais
- **admin**: Administradores do sistema

## 8. Sistema de Créditos e Eventos da COP30

### 8.1 Sistema AmaCoins

O sistema de créditos, batizado como **AmaCoins**, funciona como uma moeda virtual dentro da plataforma:

- **AmaCoins** são a unidade de valor e recompensa da plataforma
- Usuários visualizam seu saldo de **AmaCoins** em seu perfil
- Cada evento e local oferece uma quantidade específica de **AmaCoins**
- Os usuários podem acompanhar seu histórico de ganhos e gastos de **AmaCoins**

### 8.2 Integração com a Agenda da COP30

O sistema é construído especialmente para trabalhar em sintonia com a programação oficial da COP30:

- **Eventos Prioritários**: Os eventos oficiais da COP30 oferecem as maiores quantidades de **AmaCoins** para incentivar a participação ativa na conferência
- **Categorização de Eventos**:
  - **Eventos Oficiais da COP30**: 100-300 **AmaCoins** (palestras principais, plenárias)
  - **Eventos Paralelos da COP30**: 50-150 **AmaCoins** (workshops, exposições)
  - **Eventos Culturais Locais**: 30-80 **AmaCoins** (apresentações culturais, feiras)
  - **Pontos Turísticos**: 20-50 **AmaCoins** (museus, parques, mercados)
  - **Estabelecimentos Parceiros**: 10-30 **AmaCoins** (restaurantes, lojas)

### 8.3 Acúmulo de AmaCoins

- Cada evento/local tem um valor predefinido de **AmaCoins** baseado em sua categoria
- Sistema de bônus para participação em eventos relacionados (ex: série de workshops sobre o mesmo tema)
- Pontuação extra para visitas realizadas em dias específicos para equilibrar o fluxo de visitantes
- Bonificações especiais por completar quizzes temáticos relacionados aos eventos

### 8.4 Verificação de Participação

Para o MVP, o sistema utilizará os seguintes métodos de verificação:

1. **QR Codes em Eventos**: 
   - Organizadores disponibilizam QR codes nos eventos
   - Visitantes escaneiam o código através do aplicativo
   - Sistema valida participação e concede **AmaCoins** automaticamente

2. **Códigos de Verificação em Locais Turísticos**:
   - Usuário solicita código ao responsável no local
   - Parceiro gera código através do painel administrativo
   - Usuário insere código em seu aplicativo para receber **AmaCoins**

### 8.5 Painel de Controle de Eventos

Para administradores e organizadores da COP30:
- Gerenciamento da agenda oficial 
- Monitoramento em tempo real da participação
- Estatísticas de visitação por evento
- Ajuste dinâmico da quantidade de **AmaCoins** para incentivar participação em eventos específicos

### 8.6 Resgate de Recompensas

O sistema oferece dois tipos principais de resgate:

#### 8.6.1 Produtos Físicos em Lojas Parceiras
1. Usuário seleciona produto físico desejado no catálogo
2. Sistema verifica saldo de **AmaCoins**
3. **AmaCoins** são debitados da conta após confirmação
4. Usuário recebe comprovante digital com QR code
5. Parceiro valida o QR code no momento do resgate físico na loja

#### 8.6.2 Serviços e Descontos em Aplicativos
1. Usuário seleciona serviço digital ou desconto para aplicativo
2. Sistema verifica saldo de **AmaCoins**
3. **AmaCoins** são debitados após confirmação
4. Para aplicativos parceiros integrados:
   - Sistema gera código de resgate ou ativa desconto via API
   - Usuário recebe notificação de ativação no aplicativo parceiro
5. Para cupons de desconto:
   -# Documentação Técnica - AmazôniaExperience (Continuação)

#### 8.6.3 Tipos de Recompensas Disponíveis
- **Produtos Físicos**: Souvenirs, produtos típicos amazônicos, Produtos de perfumaria, Vouchers para supermercado
- **Descontos em Serviços**: Restaurantes, passeios turísticos, transporte
- **Benefícios em Aplicativos**: Créditos para transporte por app, delivery de comida, hospedagem
- **Experiências Exclusivas**: Visitas guiadas, workshops, atividades culturais

## 9. Recursos Especiais

### 9.1 Chatbot Contextual

O chatbot integrado oferece suporte em tempo real e informações contextuais para os usuários:

#### 9.1.1 Funcionalidades Principais
- **Informações Contextuais**: Detalhes sobre locais e eventos durante check-ins
- **Alertas Personalizados**: Notificações sobre eventos próximos alinhados aos interesses do usuário
- **Assistência de Navegação**: Ajuda para encontrar locais, serviços ou eventos
- **Traduções Básicas**: Frases úteis em português e informações culturais

#### 9.1.2 Tecnologia
- Processamento de linguagem natural básico para interpretação de consultas
- Base de conhecimento estruturada sobre a COP30 e Belém
- Sistema de feedback para melhoria contínua
- Suporte aos 7 idiomas principais da plataforma

#### 9.1.3 Integração com Outros Módulos
- Conectado ao sistema de alertas para notificações de eventos
- Acesso ao mapa de conectividade para recomendar locais com Wi-Fi
- Integração com serviços de emergência para fornecer informações críticas
- Capacidade de iniciar quizzes relacionados aos tópicos perguntados

### 9.2 Quizzes Temáticos

O sistema de quizzes foi projetado para enriquecer a experiência educacional dos usuários, oferecendo conteúdo relacionado à COP30 de forma interativa e gamificada:

#### 9.2.1 Estrutura dos Quizzes
- **Categorias de Quizzes**: Mudanças climáticas, biodiversidade amazônica, soluções sustentáveis, história da COP
- **Níveis de Dificuldade**: Básico, intermediário e avançado
- **Tipos de Perguntas**: Múltipla escolha, verdadeiro/falso, associação, resposta curta
- **Recompensas**: AmaCoins concedidos com base na pontuação e dificuldade

#### 9.2.2 Implementação Técnica
- Quizzes armazenados em formato JSON para fácil atualização
- Lógica de pontuação processada no backend para evitar manipulação
- Suporte a mídia (imagens, gráficos) nas perguntas
- Sistema de cache para funcionamento offline

#### 9.2.3 Gamificação
- Leaderboards por nacionalidade e área de estudo
- Conquistas desbloqueáveis por completar séries de quizzes
- Quizzes diários com recompensas especiais
- Modo competitivo para grupos de estudantes

### 9.3 Mapa de Conectividade

A funcionalidade de mapa de conectividade auxilia visitantes a encontrar acesso confiável à Internet em Belém:

#### 9.3.1 Dados Mapeados
- **Pontos de Wi-Fi Público**: Localização, velocidade média, limite de uso
- **Estabelecimentos com Wi-Fi**: Restaurantes, cafés, hotéis com conectividade
- **Qualidade de Rede Móvel**: Cobertura 4G/5G por operadora em diferentes áreas
- **Pontos de Recarga**: Locais para carregar dispositivos

#### 9.3.2 Recursos do Mapa
- Visualização em mapa de calor da qualidade de conectividade
- Filtros por tipo de conexão, velocidade e gratuidade
- Informações sobre restrições de acesso ou senhas necessárias
- Feedback crowdsourced para atualização em tempo real

#### 9.3.3 Funcionalidade Offline
- Download de mapas de conectividade para uso sem Internet
- Sincronização automática quando a conexão é restabelecida
- Cache de senhas e informações de acesso para locais favoritos

### 9.4 Guia de Emergência Multilíngue

O guia de emergência fornece informações críticas de saúde e segurança em todos os idiomas suportados:

#### 9.4.1 Conteúdo do Guia
- **Serviços Médicos**: Hospitais, clínicas, farmácias com geolocalização
- **Contatos de Emergência**: Polícia, bombeiros, ambulância, defesa civil
- **Embaixadas e Consulados**: Informações de contato por nacionalidade
- **Frases de Emergência**: Expressões essenciais em português com pronúncia

#### 9.4.2 Recursos Especiais
- Modo offline para acesso sem Internet
- Botões de emergência com discagem rápida
- Cartões traduzidos para mostrar a profissionais médicos
- Instruções visuais para situações de emergência

#### 9.4.3 Integrações
- Mapas com rotas para o serviço de emergência mais próximo
- Notificações de alertas climáticos ou de segurança
- Compartilhamento de localização em situações de emergência
- Suporte via chatbot para orientações em caso de necessidade

## 10. Configuração de Ambiente

### 10.1 Variáveis de Ambiente (.env)
```
# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Database
DB_FILENAME=database.sqlite

# Segurança
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CSP_DIRECTIVES=default-src 'self'; script-src 'self'

# PWA
CACHE_VERSION=1.0.0
OFFLINE_ANALYTICS_QUEUE_SIZE=20

# Chatbot
CHATBOT_NLP_MODEL=basic
CHATBOT_CONFIDENCE_THRESHOLD=0.7

# Quizzes
QUIZ_DEFAULT_TIMEOUT_MINUTES=15
QUIZ_MAX_ATTEMPTS_PER_DAY=5

# Mapas e Serviços
LEAFLET_API_KEY=your_leaflet_api_key
GEOCODING_API_KEY=your_geocoding_api_key

# Cors
CORS_ORIGIN=http://localhost:3000

# Internacionalização
DEFAULT_LANGUAGE=pt-BR
SUPPORTED_LANGUAGES=pt-BR,en-US,es-ES,fr-FR,de-DE,zh-CN,ru-RU
```

### 10.2 Instalação e Execução
```bash
# Instalação
npm install

# Migrations
npm run migrate

# Seeds (dados iniciais)
npm run seed

# Desenvolvimento
npm run dev

# Produção
npm start
```

### 10.3 Configuração do PWA
Para habilitar funcionalidades offline:

1. Registrar service worker no frontend:
```javascript
// Em public/js/app.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso!');
      })
      .catch(error => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  });
}
```

2. Configurar arquivos para cache offline em `public/service-worker.js`:
```javascript
const CACHE_NAME = 'amazonia-experience-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/offline.html',
  '/images/logo.png',
  '/emergency/contacts.json',
  '/connectivity/wifi-spots.json',
  '/quizzes/basic-level.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

3. Implementar sincronização em segundo plano:
```javascript
// Exemplo: Fila de sincronização para check-ins offline
const bgSync = async () => {
  const offlineCheckins = await getOfflineData('checkins');
  if (offlineCheckins.length > 0) {
    try {
      await Promise.all(offlineCheckins.map(checkin => 
        fetch('/api/places/checkin', {
          method: 'POST',
          body: JSON.stringify(checkin),
          headers: {'Content-Type': 'application/json'}
        })
      ));
      await clearOfflineData('checkins');
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  }
};
```

### 10.4 Configuração de Idiomas
Para configurar o suporte multilíngue:

1. Estrutura de arquivos de tradução:
```
/locales
  /pt-BR
    translation.json
  /en-US
    translation.json
  /es-ES
    translation.json
  /fr-FR
    translation.json
  /de-DE
    translation.json
  /zh-CN
    translation.json
  /ru-RU
    translation.json
```

2. Exemplo de arquivo de tradução (`/locales/en-US/translation.json`):
```json
{
  "welcome": "Welcome to AmazôniaExperience",
  "events": {
    "title": "COP30 Events",
    "checkIn": "Check in at this event",
    "credits": "Earn {{amount}} AmaCoins"
  },
  "profile": {
    "balance": "Your AmaCoins balance",
    "history": "Visit history"
  },
  "emergency": {
    "call": "Emergency Call",
    "medical": "Medical Services",
    "police": "Police"
  },
  "quizzes": {
    "start": "Start Quiz",
    "points": "Potential AmaCoins: {{amount}}"
  },
  "connectivity": {
    "wifi_spots": "Wi-Fi Spots Nearby",
    "signal_strength": "Signal Strength"
  }
}
```

3. Configuração do i18next no frontend:
```javascript
import i18next from 'i18next';

i18next.init({
  lng: navigator.language || 'en-US',
  fallbackLng: 'en-US',
  resources: {
    'en-US': { translation: require('../locales/en-US/translation.json') },
    'pt-BR': { translation: require('../locales/pt-BR/translation.json') },
    // Outros idiomas
  }
});

// Uso: i18next.t('welcome')
```

## 11. Guia de Desenvolvimento

### 11.1 Padrões de Código
- Utilizar ESLint e Prettier para manter padrões
- Seguir princípios RESTful para API
- Utilizar async/await para código assíncrono
- Documentar funções e endpoints

### 11.2 Migrations
Utilizamos Knex.js para gerenciar migrations:

```javascript
// Exemplo de migration
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.enu('role', ['user', 'partner', 'admin']).defaultTo('user');
    table.integer('amacoins').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

### 11.3 Tratamento de Erros
Implementar middleware global para tratamento de erros:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Erro interno do servidor'
  });
});
```

### 11.4 Testes
Os testes são organizados por módulos, seguindo a estrutura de diretórios do projeto:

```javascript
// Exemplo de teste para API de quiz
describe('Quiz API', () => {
  it('should return available quizzes', async () => {
    const res = await request(app).get('/api/quizzes');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
  
  it('should award correct amount of AmaCoins for completed quiz', async () => {
    // Setup e teste
  });
});
```

## 12. Roadmap

### Fase 1: MVP (Minimum Viable Product)
- Sistema básico de autenticação com segurança avançada
- Cadastro de locais e parceiros
- Check-in via códigos de verificação
- Perfil de usuário com histórico
- Painel básico para parceiros
- Suporte a PWA básico para cache offline
- Suporte multilíngue para os 7 idiomas prioritários
- **Chatbot contextual com funcionalidades básicas**
- **Quizzes temáticos simples sobre a COP30**
- **Mapa de conectividade com pontos principais**
- **Guia de emergência multilíngue com informações essenciais**

### Fase 2: Aprimoramentos
- Geolocalização para validação de visitas
- Upload de fotos pelos usuários
- Feed de atividades recentes
- Recursos avançados de PWA com sincronização em segundo plano
- Integração com aplicativos parceiros para resgates digitais
- Recursos de segurança avançados (TBAC - Token-Based Access Control)
- **Chatbot com alertas personalizados e recomendações inteligentes**
- **Sistema de quizzes com gamificação (rankings, conquistas)**
- **Mapa de conectividade com dados em tempo real e avaliações de usuários**
- **Expansão do guia de emergência com mais recursos e integrações**

### Fase 3: Expansão
- Integração com APIs de pagamento
- Marketplace para produtos locais
- Gamificação avançada (níveis, conquistas)
- Recomendações baseadas em IA
- Suporte para eventos além da COP30
- Aplicativo móvel nativo complementar
- Análise avançada de dados de usuários e tendências de visitação
- **Chatbot com reconhecimento de voz e capacidades de tradução simultânea**
- **Quizzes colaborativos e competições entre instituições acadêmicas**
- **API pública para compartilhamento de dados de conectividade**
- **Integração do guia de emergência com serviços de saúde locais**

## 13. Segurança e Conformidade

### 13.1 Análise de Ameaças
O sistema foi desenvolvido considerando as seguintes potenciais ameaças:

- **Injeção SQL**: Mitigada através do uso de queries parametrizadas via Knex.js
- **XSS (Cross-Site Scripting)**: Prevenido através de sanitização de inputs e uso adequado de Content Security Policy
- **CSRF (Cross-Site Request Forgery)**: Implementação de tokens anti-CSRF
- **Vazamento de Dados Sensíveis**: Criptografia adequada para senhas (bcrypt) e informações pessoais
- **Broken Authentication**: Sistema robusto de autenticação com tokens JWT, rotação e invalidação adequada
- **Elevação de Privilégios**: Controle de acesso rígido baseado em funções
- **Ataques de Força Bruta**: Implementação de rate limiting e políticas de complexidade de senha
- **Man-in-the-Middle**: HTTPS obrigatório em produção

### 13.2 Proteção de Dados Pessoais
O sistema é projetado em conformidade com regulamentações de proteção de dados:

- **LGPD (Brasil)**: Consentimento explícito para coleta de dados, direito de acessar/excluir dados
- **GDPR (Europa)**: Suporte para visitantes europeus com conformidade às regulamentações
- **Cookies e Rastreamento**: Política clara e opt-in para cookies não essenciais
- **Anonimização**: Opção para anonimizar dados estatísticos para fins de análise

### 13.3 Auditoria e Logging
- Logs detalhados para ações sensíveis (login, mudança de privilégios, transações)
- Formato estruturado para facilitar análise
- Timestamps precisos e consistentes
- Retenção segura e adequada conforme requisitos legais

### 13.4 Testes de Segurança
- Testes de penetração regulares
- Análise de código estático via SonarQube
- Verificação de vulnerabilidades em dependências (OWASP Dependency Check)
- Testes de injeção automatizados

### 13.5 Políticas de Senhas e Autenticação
- Complexidade mínima exigida (8+ caracteres, combinação de tipos)
- Proibição de senhas comuns ou previamente comprometidas
- Opção para 2FA (autenticação de dois fatores) para operações críticas
- Expiração de sessões após período de inatividade

----------------------------------------------------------------------------------------------

Esta documentação será atualizada regularmente durante o desenvolvimento do MVP. Para mais informações, entre em contato com os autores.

**Caique Rabelo Neves e Lucas Soares dos Santos**  
**caiquerabelo2015@hotmail.com / lluquinhas482@gmail.com**