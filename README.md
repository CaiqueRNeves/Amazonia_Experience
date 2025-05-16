# 🌳 AmazôniaExperience

![AmazôniaExperience](https://img.shields.io/badge/COP30-Bel%C3%A9m%202025-brightgreen)
![Status](https://img.shields.io/badge/Status-MVP%20Development-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20|%20Express%20|%20SQLite-orange)
![Currency](https://img.shields.io/badge/Moeda-AmaCoins-yellow)
![Languages](https://img.shields.io/badge/Languages-7-purple)
![PWA](https://img.shields.io/badge/PWA-Enabled-blueviolet)

## 🌎 Transformando a experiência de visitantes na COP30

**AmazôniaExperience** é uma plataforma inovadora que visa enriquecer a experiência de visitantes internacionais, especialmente estudantes e acadêmicos, durante a COP30 em Belém do Pará (10-21 de novembro de 2025). Através de um sistema de gamificação integrado com a agenda oficial do evento, incentivamos a exploração cultural e turística da região amazônica, promovendo o turismo sustentável e a valorização da cultura local.

> **"Conheça Belém, participe dos eventos da COP30 e acumule AmaCoins para experiências únicas da Amazônia"**

## ✨ Funcionalidades Principais

- **Check-in em Eventos da COP30**: Acumule **AmaCoins** participando dos eventos oficiais da conferência
- **Exploração Turística**: Visite pontos turísticos e estabelecimentos locais para ganhar **AmaCoins** adicionais
- **Perfil de Viajante**: Acompanhe sua jornada pela Amazônia com registro dos locais visitados
- **Sistema de Recompensas Flexível**: Troque seus **AmaCoins** por produtos físicos em lojas parceiras ou por descontos em serviços e aplicativos credenciados
- **ChatBot Contextual**: Receba informações sobre locais visitados e alertas personalizados de eventos próximos
- **Quizzes Temáticos**: Teste seus conhecimentos sobre temas da COP30 e ganhe **AmaCoins** extras
- **Mapas Especiais**: Acesse mapas de conectividade Wi-Fi e serviços essenciais em Belém
- **Guia de Emergência Multilíngue**: Informações de saúde e contatos de emergência em 7 idiomas
- **Experiência Offline**: Acesse mapas, informações e tickets mesmo sem conexão à internet
- **Multilíngue**: Disponível em Português, Inglês, Espanhol, Francês, Alemão, Mandarim e Russo

## 🚀 Por que AmazôniaExperience?

- **Para Visitantes**: Descubra a Amazônia de forma interativa e ganhe benefícios reais tanto em produtos físicos quanto em serviços digitais
- **Para Parceiros**: Conecte-se com visitantes internacionais e aumente sua visibilidade durante o evento
- **Para a Cidade**: Promova o turismo consciente e a economia local
- **Para a COP30**: Incentive a participação ativa nos eventos oficiais da conferência

## 💻 Arquitetura

### Frontend
- **Tecnologias**: HTML5, CSS3, JavaScript 
- **Interface Responsiva**: Experiência otimizada para desktop e dispositivos móveis
- **Progressive Web App (PWA)**: Funcionalidade offline e instalação na tela inicial
- **Multilíngue**: Suporte completo para 7 idiomas prioritários
- **Chatbot Integrado**: Motor de IA para fornecer informações contextuais e alertas
- **Sistema de Quiz**: Motor interativo de perguntas e respostas temáticas
- **Páginas Principais**: Login/Registro, Perfil, Mapa de Pontos, Catálogo de Recompensas, Mapas Especiais, Guia de Emergência

### Backend
- **Servidor**: Node.js com Express.js
- **Autenticação**: JWT (JSON Web Tokens) com práticas avançadas de segurança
- **Banco de Dados**: SQLite com sistema de migrations
- **API RESTful**: Endpoints seguros para todas as funcionalidades do sistema
- **Segurança**: Implementação de OWASP Top 10, sanitização de dados, prevenção contra injeção SQL
- **Sistema de Notificações**: Motor de alertas baseados em localização e preferências

## 📱 Recursos Especiais

### ChatBot Contextual
O chatbot fornece informações úteis e personalizadas aos usuários:
- Detalhes históricos e culturais sobre locais visitados e eventos
- Alertas inteligentes sobre eventos da agenda oficial próximos ao usuário
- Recomendações baseadas em interesses e histórico de visitação
- Suporte básico em todos os 7 idiomas da plataforma

### Quizzes Temáticos
Sistema de gamificação educativa sobre temas da COP30:
- Perguntas sobre mudanças climáticas, biodiversidade amazônica e desenvolvimento sustentável
- Diferentes níveis de dificuldade para diversos públicos
- Recompensas em AmaCoins para respostas corretas
- Rankings e conquistas para estimular a participação

### Mapa de Conectividade
Facilitando o acesso à internet em Belém:
- Localização de pontos de Wi-Fi público e gratuito
- Indicação de qualidade de conexão e velocidades disponíveis
- Estabelecimentos com Wi-Fi confiável
- Funciona offline após o primeiro download

### Guia de Emergência Multilíngue
Suporte essencial para visitantes internacionais:
- Contatos de serviços médicos e emergências
- Localização de farmácias, hospitais e delegacias
- Frases úteis para situações de emergência em português
- Informações de embaixadas e consulados por nacionalidade

## 🛠️ Instalação e Uso

1. Clone este repositório
```
git clone https://github.com/CaiqueRNeves/Amazonia_Experience.git
```

2. Instale as dependências
```
cd amazonia-experience
npm install
```

3. Configure as variáveis de ambiente
```
cp .env.example .env
```

4. Execute as migrations
```
npm run migrate
```

5. Inicie o servidor de desenvolvimento
```
npm run dev
```
------------------------------------------------------------------------------------------------------------------

**Autores:**  
**Caique Rabelo Neves**  
Email: caiquerabelo2015@hotmail.com

**Lucas Soares dos Santos**  
**Email: lluquinhas482@gmail.com**

------------------------------------------------------------------------------------------------------------------