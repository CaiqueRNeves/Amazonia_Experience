# API Documentation - AmazôniaExperience

## Informações Gerais

**Versão:** 0.1.0 (MVP)  
**URL Base:** `http://localhost:3000/api` (desenvolvimento local)  
**Formato de Dados:** JSON  
**Autenticação:** JWT (Bearer Token)

## Índice
1. [Autenticação](#autenticação)
2. [Usuários](#usuários)
3. [Eventos](#eventos)
4. [Locais](#locais-places)
5. [Quizzes](#quizzes)
6. [Recompensas](#recompensas)
7. [Conectividade](#conectividade)
8. [Emergência](#emergência)
9. [Chatbot](#chatbot)
10. [Admin](#admin)
11. [Códigos de Erro](#códigos-de-erro)

## Emergência

### Endpoints de Emergência

#### `GET /emergency/services`

Lista serviços de emergência.

**Parâmetros de consulta opcionais:**
- `page`: Número da página (default: 1)
- `limit`: Registros por página (default: 10)
- `is_24h`: Filtrar serviços 24h (true/false)
- `language`: Filtrar por idioma falado
- `search`: Busca por termo

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "services": [
      {
        "id": 1,
        "name": "Hospital Pronto Socorro Municipal Mário Pinotti",
        "service_type": "hospital",
        "address": "Av. 14 de Março, s/n - Umarizal, Belém - PA",
        "latitude": -1.4547,
        "longitude": -48.4880,
        "phone_number": "(91) 3252-6111",
        "opening_hours": "24 horas",
        "is_24h": true,
        "languages_spoken": ["pt-BR", "en-US"]
      },
      {
        "id": 4,
        "name": "8º Batalhão de Polícia Militar",
        "service_type": "police",
        "address": "Av. Governador José Malcher, 1365 - Nazaré, Belém - PA",
        "latitude": -1.4567,
        "longitude": -48.4798,
        "phone_number": "190",
        "alternative_phone": "(91) 3214-2190",
        "opening_hours": "24 horas",
        "is_24h": true,
        "languages_spoken": ["pt-BR"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10
    }
  }
}
```

#### `GET /emergency/services/:type`

Filtra serviços por tipo.

**Parâmetros de caminho:**
- `type`: Tipo de serviço ('hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police')

**Parâmetros de consulta opcionais:**
- `page`: Número da página (default: 1)
- `limit`: Registros por página (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "services": [
      {
        "id": 1,
        "name": "Hospital Pronto Socorro Municipal Mário Pinotti",
        "service_type": "hospital",
        "address": "Av. 14 de Março, s/n - Umarizal, Belém - PA",
        "latitude": -1.4547,
        "longitude": -48.4880,
        "phone_number": "(91) 3252-6111",
        "opening_hours": "24 horas",
        "is_24h": true,
        "languages_spoken": ["pt-BR", "en-US"]
      },
      {
        "id": 2,
        "name": "Hospital de Pronto Socorro Dr. João Lúcio Pereira Machado",
        "service_type": "hospital",
        "address": "Av. Cosme Ferreira, 3937 - Aleixo, Belém - PA",
        "latitude": -1.4410,
        "longitude": -48.4762,
        "phone_number": "(91) 3249-9555",
        "opening_hours": "24 horas",
        "is_24h": true,
        "languages_spoken": ["pt-BR"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10
    }
  }
}
```

#### `GET /emergency/services/nearby`

Encontra serviços de emergência próximos.

**Parâmetros de consulta:**
- `latitude`: Latitude da posição atual (obrigatório)
- `longitude`: Longitude da posição atual (obrigatório)
- `radius`: Raio em km (opcional, default: 5)
- `type`: Tipo de serviço (opcional)
- `page`: Número da página (opcional, default: 1)
- `limit`: Registros por página (opcional, default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "services": [
      {
        "id": 1,
        "name": "Hospital Pronto Socorro Municipal Mário Pinotti",
        "service_type": "hospital",
        "address": "Av. 14 de Março, s/n - Umarizal, Belém - PA",
        "latitude": -1.4547,
        "longitude": -48.4880,
        "phone_number": "(91) 3252-6111",
        "opening_hours": "24 horas",
        "is_24h": true,
        "languages_spoken": ["pt-BR", "en-US"],
        "distance": 1.3 // Distância em km
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10
    }
  }
}
```

#### `GET /emergency/contacts/:language`

Obtém contatos de emergência por idioma.

**Parâmetros de caminho:**
- `language`: Código do idioma ('pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU')

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "contacts": {
      "emergency": {
        "police": "190",
        "ambulance": "192",
        "fire_department": "193"
      },
      "embassies": [
        {
          "country": "United States",
          "name": "Consulado dos Estados Unidos em Belém",
          "address": "Av. Boulevard Castilhos França, 452 - Campina, Belém - PA",
          "phone": "(91) 3226-9695",
          "email": "belemacs@state.gov"
        }
      ],
      "tourist_police": {
        "name": "Delegacia Especializada em Atendimento ao Turista (DEAT)",
        "address": "Av. Presidente Vargas, 915 - Campina, Belém - PA",
        "phone": "(91) 3222-2150",
        "mobile": "(91) 98415-3434"
      }
    }
  }
}
```

#### `GET /emergency/phrases/:language`

Obtém frases de emergência úteis em um idioma específico.

**Parâmetros de caminho:**
- `language`: Código do idioma ('pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU')

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "phrases": {
      "medical": [
        {
          "id": 1,
          "text": "I need medical help",
          "translation": "Eu preciso de ajuda médica",
          "pronunciation": "Ew preh-SEE-zo de ah-JOO-dah MEH-dee-kah"
        },
        {
          "id": 2,
          "text": "I am allergic to penicillin",
          "translation": "Eu sou alérgico a penicilina",
          "pronunciation": "Ew so ah-LEHR-zhee-koh ah peh-nee-see-LEE-nah"
        }
      ],
      "police": [
        {
          "id": 5,
          "text": "I need the police",
          "translation": "Eu preciso da polícia",
          "pronunciation": "Ew preh-SEE-zo dah poh-LEE-see-ah"
        }
      ],
      "general": [
        {
          "id": 10,
          "text": "Help me please",
          "translation": "Por favor, me ajude",
          "pronunciation": "Poor fah-VOR, me ah-JOO-day"
        }
      ]
    }
  }
}
```

## Chatbot

### Endpoints de Chatbot

#### `POST /chat/message`

Envia mensagem para o chatbot.

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "message": "Onde encontrar pontos de Wi-Fi gratuito?",
  "context_type": "connectivity",
  "context_id": 1
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "userMessage": {
      "id": 1,
      "user_id": 2,
      "message": "Onde encontrar pontos de Wi-Fi gratuito?",
      "is_from_user": true,
      "context_type": "connectivity",
      "context_id": 1,
      "created_at": "2023-06-20T20:15:00.000Z"
    },
    "botMessage": {
      "id": 2,
      "user_id": 2,
      "message": "Você pode encontrar pontos de Wi-Fi gratuito na seção 'Conectividade' do aplicativo. A maioria dos locais oficiais da COP30 possui conexão Wi-Fi gratuita.",
      "is_from_user": false,
      "context_type": "connectivity",
      "context_id": 1,
      "created_at": "2023-06-20T20:15:02.000Z"
    }
  }
}
```

#### `GET /chat/history`

Obtém histórico de conversas.

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>`

**Parâmetros de consulta opcionais:**
- `page`: Número da página (default: 1)
- `limit`: Registros por página (default: 20)
- `context_type`: Filtrar por tipo de contexto
- `context_id`: Filtrar por ID de contexto

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": 1,
        "user_id": 2,
        "message": "Onde encontrar pontos de Wi-Fi gratuito?",
        "is_from_user": true,
        "context_type": "connectivity",
        "context_id": 1,
        "created_at": "2023-06-20T20:15:00.000Z"
      },
      {
        "id": 2,
        "user_id": 2,
        "message": "Você pode encontrar pontos de Wi-Fi gratuito na seção 'Conectividade' do aplicativo. A maioria dos locais oficiais da COP30 possui conexão Wi-Fi gratuita.",
        "is_from_user": false,
        "context_type": "connectivity",
        "context_id": 1,
        "created_at": "2023-06-20T20:15:02.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20
    }
  }
}
```

#### `GET /chat/context/:entity_type/:entity_id`

Obtém informações contextuais para um local ou evento.

**Parâmetros de caminho:**
- `entity_type`: Tipo de entidade ('event', 'place', 'emergency', 'connectivity')
- `entity_id`: ID da entidade

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "context": {
      "name": "Cerimônia de Abertura da COP30",
      "description": "Cerimônia oficial de abertura da 30ª Conferência das Partes da Convenção-Quadro das Nações Unidas sobre Mudança do Clima (COP30).",
      "start_time": "2025-11-10T09:00:00.000Z",
      "end_time": "2025-11-10T13:00:00.000Z",
      "location": "Hangar Centro de Convenções",
      "type": "event"
    }
  }
}
```

#### `POST /chat/feedback`

Envia feedback sobre resposta do chatbot.

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>`

**Request:**
```json
{
  "message_id": 2,
  "is_helpful": true,
  "feedback_text": "Resposta clara e objetiva"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Feedback enviado com sucesso"
}
```

## Admin

### Endpoints de Admin

#### `POST /admin/places`

Cria um novo local (admin).

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>` (usuário com função 'admin')

**Request:**
```json
{
  "name": "Novo Local Turístico",
  "description": "Descrição do novo local turístico",
  "address": "Rua Exemplo, 123 - Belém, PA",
  "latitude": -1.4500,
  "longitude": -48.4800,
  "type": "tourist_spot",
  "amacoins_value": 25,
  "partner_id": 1,
  "opening_hours": "Segunda a Domingo: 09:00 - 18:00",
  "wifi_available": true
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "place": {
      "id": 5,
      "name": "Novo Local Turístico",
      "description": "Descrição do novo local turístico",
      "address": "Rua Exemplo, 123 - Belém, PA",
      "latitude": -1.4500,
      "longitude": -48.4800,
      "type": "tourist_spot",
      "amacoins_value": 25,
      "partner_id": 1,
      "opening_hours": "Segunda a Domingo: 09:00 - 18:00",
      "wifi_available": true,
      "created_at": "2023-06-21T10:00:00.000Z",
      "updated_at": "2023-06-21T10:00:00.000Z"
    }
  }
}
```

#### `PUT /admin/places/:id`

Atualiza um local existente (admin).

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>` (usuário com função 'admin')

**Parâmetros de caminho:**
- `id`: ID do local

**Request:**
```json
{
  "name": "Local Turístico Atualizado",
  "description": "Descrição atualizada",
  "amacoins_value": 30
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "place": {
      "id": 5,
      "name": "Local Turístico Atualizado",
      "description": "Descrição atualizada",
      "address": "Rua Exemplo, 123 - Belém, PA",
      "latitude": -1.4500,
      "longitude": -48.4800,
      "type": "tourist_spot",
      "amacoins_value": 30,
      "partner_id": 1,
      "opening_hours": "Segunda a Domingo: 09:00 - 18:00",
      "wifi_available": true,
      "created_at": "2023-06-21T10:00:00.000Z",
      "updated_at": "2023-06-21T10:30:00.000Z"
    }
  }
}
```

#### `POST /admin/partners`

Cria um novo parceiro (admin).

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>` (usuário com função 'admin')

**Request:**
```json
{
  "user_id": 10,
  "business_name": "Novo Restaurante Parceiro",
  "business_type": "restaurant",
  "address": "Av. Principal, 456 - Belém, PA",
  "contact_phone": "(91) 98765-4321"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "partner": {
      "id": 3,
      "user_id": 10,
      "business_name": "Novo Restaurante Parceiro",
      "business_type": "restaurant",
      "address": "Av. Principal, 456 - Belém, PA",
      "contact_phone": "(91) 98765-4321",
      "created_at": "2023-06-21T11:00:00.000Z"
    }
  }
}
```

#### `PUT /admin/users/:id/role`

Altera função de usuário (admin).

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>` (usuário com função 'admin')

**Parâmetros de caminho:**
- `id`: ID do usuário

**Request:**
```json
{
  "role": "partner"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 10,
      "name": "Novo Parceiro",
      "email": "parceiro@example.com",
      "role": "partner"
    }
  }
}
```

#### `POST /admin/quizzes`

Cria novo quiz (admin).

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>` (usuário com função 'admin')

**Request:**
```json
{
  "title": "Novo Quiz sobre Biodiversidade",
  "description": "Teste seus conhecimentos sobre a biodiversidade amazônica",
  "difficulty": "medium",
  "topic": "biodiversity",
  "amacoins_reward": 60,
  "questions": [
    {
      "question_text": "Qual é o maior peixe de água doce da Amazônia?",
      "question_type": "multiple_choice",
      "options": ["Pirarucu", "Tambaqui", "Tucunaré", "Dourado"],
      "correct_answer": "Pirarucu",
      "explanation": "O Pirarucu (Arapaima gigas) pode chegar a 3 metros de comprimento e pesar mais de 200 kg."
    },
    {
      "question_text": "A Floresta Amazônica abriga mais de 10% das espécies conhecidas do planeta?",
      "question_type": "true_false",
      "correct_answer": "true",
      "explanation": "Sim, a Amazônia abriga mais de 10% de todas as espécies conhecidas, sendo um dos maiores centros de biodiversidade do planeta."
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "quiz": {
      "id": 3,
      "title": "Novo Quiz sobre Biodiversidade",
      "description": "Teste seus conhecimentos sobre a biodiversidade amazônica",
      "difficulty": "medium",
      "topic": "biodiversity",
      "amacoins_reward": 60,
      "created_at": "2023-06-21T12:00:00.000Z"
    },
    "questions": [
      {
        "id": 5,
        "quiz_id": 3,
        "question_text": "Qual é o maior peixe de água doce da Amazônia?",
        "question_type": "multiple_choice",
        "options": ["Pirarucu", "Tambaqui", "Tucunaré", "Dourado"],
        "explanation": "O Pirarucu (Arapaima gigas) pode chegar a 3 metros de comprimento e pesar mais de 200 kg."
      },
      {
        "id": 6,
        "quiz_id": 3,
        "question_text": "A Floresta Amazônica abriga mais de 10% das espécies conhecidas do planeta?",
        "question_type": "true_false",
        "explanation": "Sim, a Amazônia abriga mais de 10% de todas as espécies conhecidas, sendo um dos maiores centros de biodiversidade do planeta."
      }
    ]
  }
}
```

#### `POST /admin/emergency/services`

Adiciona serviço de emergência (admin).

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>` (usuário com função 'admin')

**Request:**
```json
{
  "name": "Nova Farmácia 24h",
  "service_type": "pharmacy",
  "address": "Av. Central, 789 - Belém, PA",
  "latitude": -1.4600,
  "longitude": -48.4850,
  "phone_number": "(91) 3333-4444",
  "opening_hours": "24 horas",
  "is_24h": true,
  "languages_spoken": ["pt-BR", "en-US", "es-ES"]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "service": {
      "id": 8,
      "name": "Nova Farmácia 24h",
      "service_type": "pharmacy",
      "address": "Av. Central, 789 - Belém, PA",
      "latitude": -1.4600,
      "longitude": -48.4850,
      "phone_number": "(91) 3333-4444",
      "opening_hours": "24 horas",
      "is_24h": true,
      "languages_spoken": ["pt-BR", "en-US", "es-ES"],
      "created_at": "2023-06-21T13:00:00.000Z",
      "updated_at": "2023-06-21T13:00:00.000Z"
    }
  }
}
```

#### `PUT /admin/connectivity/spots`

Atualiza informações de pontos de conectividade (admin).

**Cabeçalhos requeridos:**
- `Authorization: Bearer <token>` (usuário com função 'admin')

**Request:**
```json
{
  "id": 1,
  "wifi_speed": "fast",
  "is_verified": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "spot": {
      "id": 1,
      "name": "Estação das Docas - Wi-Fi Público",
      "location_type": "public",
      "wifi_speed": "fast",
      "is_verified": true,
      "updated_at": "2023-06-21T14:00:00.000Z"
    }
  }
}
```

## Códigos de Erro

A API utiliza códigos de status HTTP padrão para indicar o sucesso ou falha de uma requisição:

### Códigos de Sucesso
- `200 OK`: A requisição foi bem-sucedida
- `201 Created`: O recurso foi criado com sucesso
- `204 No Content`: A requisição foi bem-sucedida, mas não há conteúdo para retornar

### Códigos de Erro
- `400 Bad Request`: A requisição contém parâmetros inválidos ou faltando
- `401 Unauthorized`: Autenticação necessária ou falha na autenticação
- `403 Forbidden`: O usuário não tem permissão para acessar este recurso
- `404 Not Found`: O recurso solicitado não foi encontrado
- `422 Unprocessable Entity`: A requisição está bem formada, mas contém campos inválidos
- `429 Too Many Requests`: O cliente enviou muitas requisições em um determinado período
- `500 Internal Server Error`: Erro interno do servidor

### Formato de Resposta de Erro

Todas as respostas de erro seguem o mesmo formato:

```json
{
  "status": "error",
  "message": "Descrição do erro"
}
```

Para erros de validação, o campo `message` pode conter múltiplas mensagens separadas por vírgula.

### Exemplos de Erros Comuns

#### Erro de Autenticação (401)
```json
{
  "status": "error",
  "message": "Token inválido ou expirado"
}
```

#### Erro de Permissão (403)
```json
{
  "status": "error",
  "message": "Acesso não autorizado para esta função"
}
```

#### Recurso Não Encontrado (404)
```json
{
  "status": "error",
  "message": "Usuário não encontrado"
}
```

#### Erro de Validação (400)
```json
{
  "status": "error",
  "message": "O email é obrigatório, A senha deve ter no mínimo 6 caracteres"
}
```

#### Erro de Limite Excedido (429)
```json
{
  "status": "error",
  "message": "Muitas requisições, tente novamente mais tarde"
}
```