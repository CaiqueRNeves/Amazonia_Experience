# Frontend AmazôniaExperience - COP30 Belém

Aplicação frontend para a plataforma AmazôniaExperience, desenvolvida para a COP30 em Belém do Pará. O sistema permite que visitantes acumulem **AmaCoins** ao participar de eventos oficiais da COP30, visitar pontos turísticos e estabelecimentos credenciados, podendo posteriormente trocar esses créditos por produtos e serviços de parceiros locais.

## 🚀 Tecnologias Utilizadas

- **React.js**: Biblioteca JavaScript para construção de interfaces
- **React Router**: Navegação entre páginas
- **Redux**: Gerenciamento de estado
- **Axios**: Cliente HTTP para requisições à API
- **Leaflet**: Mapas interativos
- **i18next**: Internacionalização
- **Tailwind CSS**: Framework CSS utilitário
- **PWA**: Progressive Web App para funcionamento offline
- **Jest & Testing Library**: Testes automatizados

## 📦 Instalação e Uso

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd amazonia-experience-frontend
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` conforme necessário.

4. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
yarn start
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

### Comandos disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm build`: Compila o projeto para produção
- `npm test`: Executa os testes
- `npm run lint`: Verifica o código com ESLint
- `npm run lint:fix`: Corrige problemas de lint automaticamente
- `npm run format`: Formata o código com Prettier
- `npm run analyze`: Analisa o tamanho do bundle
- `npm run translate`: Extrai as chaves de tradução

## 🌐 Funcionalidades Principais

- **Autenticação**: Registro e login de usuários
- **Perfil**: Visualização e edição dos dados do usuário
- **AmaCoins**: Visualização de saldo e histórico
- **Eventos**: Listagem, mapa, detalhes e check-in
- **Locais**: Listagem, mapa, detalhes e check-in
- **Recompensas**: Catálogo e resgate
- **Quizzes**: Perguntas sobre a Amazônia e sustentabilidade
- **Chatbot**: Assistente virtual para dúvidas
- **Conectividade**: Mapa de pontos Wi-Fi
- **Emergência**: Serviços, contatos e frases úteis

## 📱 Progressive Web App (PWA)

A aplicação foi desenvolvida como PWA, permitindo:

- Instalação como aplicativo nativo
- Funcionamento offline
- Sincronização em segundo plano
- Notificações push

## 🌎 Internacionalização

A aplicação suporta os seguintes idiomas:

- Português (Brasil)
- Inglês
- Espanhol
- Francês
- Alemão
- Chinês (Mandarim)
- Russo

## 🔒 Segurança

- Autenticação via JWT com refresh tokens
- Armazenamento seguro de tokens
- Proteção contra CSRF
- Validação de entradas
- Sanitização de dados

## 📏 Padrões de Código

- ESLint para verificação de código
- Prettier para formatação consistente
- Husky para hooks de git pré-commit e pré-push
- Lint-staged para linting de arquivos staged

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

Para ver a cobertura de testes:

```bash
npm test -- --coverage
```

## 📂 Estrutura de Diretórios

```
src/
├── api/                 # Integração com o backend
├── assets/              # Imagens, fontes e outros recursos
├── components/          # Componentes React reutilizáveis
├── contexts/            # Contextos React
├── hooks/               # Hooks personalizados
├── pages/               # Páginas da aplicação
├── redux/               # Configuração do Redux
├── routes/              # Definição de rotas
├── services/            # Serviços utilitários
├── utils/               # Funções auxiliares
├── App.jsx              # Componente principal
├── index.jsx            # Ponto de entrada
└── serviceWorkerRegistration.js  # Registro do Service Worker
```

## 🎨 Tema e Estilo

O design visual da aplicação segue a temática da Amazônia e da COP30, com uma paleta de cores que inclui:

- Verde escuro (`#0B6623`): Representando a floresta amazônica
- Verde claro (`#5DBB63`): Simbolizando sustentabilidade
- Azul (`#1E90FF`): Representando os rios amazônicos
- Marrom (`#8B4513`): Representando a terra e solos amazônicos

A interface é totalmente responsiva, adaptando-se a diferentes tamanhos de tela para garantir uma boa experiência em dispositivos móveis e desktops.

## 🔄 Integração com o Backend

A aplicação se integra com o backend da AmazôniaExperience, consumindo a API RESTful disponível em `https://api.amazonia-experience.com/api`.

## 📱 Geolocalização

A aplicação utiliza os recursos de geolocalização para:

- Mostrar eventos e locais próximos à localização atual do usuário
- Validar check-ins baseados na proximidade
- Exibir a rota para serviços de emergência mais próximos

## 👥 Autores

- **Caique Rabelo Neves** - caiquerabelo2015@hotmail.com
- **Lucas Soares dos Santos** - lluquinhas482@gmail.com

## 🙏 Agradecimentos

- Equipe de organização da COP30
- Secretaria de Turismo de Belém
- Parceiros do projeto AmazôniaExperience