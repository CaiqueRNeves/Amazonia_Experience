# 🌳 AmazôniaExperience

## 🌎 Transformando a experiência de visitantes na COP30

**AmazôniaExperience** é uma plataforma inovadora que visa enriquecer a experiência de visitantes internacionais, especialmente estudantes e acadêmicos, durante a COP30 em Belém do Pará. Através de um sistema de gamificação integrado com a agenda oficial do evento, incentivamos a exploração cultural e turística da região amazônica, promovendo o turismo sustentável e a valorização da cultura local.

> **"Conheça Belém, participe dos eventos da COP30 e acumule AmaCoins para experiências únicas da Amazônia"**

## ✨ Funcionalidades Principais

- **Check-in em Eventos da COP30**: Acumule **AmaCoins** participando dos eventos oficiais da conferência
- **Exploração Turística**: Visite pontos turísticos e estabelecimentos locais para ganhar **AmaCoins** adicionais
- **Perfil de Viajante**: Acompanhe sua jornada pela Amazônia com registro dos locais visitados
- **Sistema de Recompensas Flexível**: Troque seus **AmaCoins** por produtos físicos em lojas parceiras ou por descontos em serviços e aplicativos credenciados
- **Descoberta Cultural**: Encontre pontos de interesse e receba recomendações personalizadas
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
- **Multilíngue**: Suporte completo para Português, Inglês, Espanhol, Francês, Alemão, Mandarim e Russo
- **Páginas Principais**: Login/Registro, Perfil, Mapa de Pontos, Catálogo de Recompensas

### Backend
- **Servidor**: Node.js com Express.js
- **Autenticação**: JWT (JSON Web Tokens) com práticas avançadas de segurança
- **Banco de Dados**: SQLite com sistema de migrations
- **API RESTful**: Endpoints seguros para todas as funcionalidades do sistema
- **Segurança**: Implementação de OWASP Top 10, sanitização de dados, prevenção contra injeção SQL

## 🛠️ Instalação e Uso

1. Clone este repositório
```
git clone https://github.com/CaiqueRNeves/Amazonia_Experience.git
```

2. Instale as dependências
```
cd Amazonia_Experience
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

## 📞 Contato

**Autores:**  
**Caique Rabelo Neves**  
Email: caiquerabelo2015@hotmail.com

**Lucas Soares dos Santos**  
Email: lluquinhas482@gmail.com
---
