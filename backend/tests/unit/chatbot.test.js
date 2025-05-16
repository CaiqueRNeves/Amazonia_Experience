const chatbotService = require('../../src/services/chatbotService');
const ChatMessage = require('../../src/models/ChatMessage');
const User = require('../../src/models/User');
const Event = require('../../src/models/Event');
const Place = require('../../src/models/Place');

// Mock dos modelos
jest.mock('../../src/models/ChatMessage');
jest.mock('../../src/models/User');
jest.mock('../../src/models/Event');
jest.mock('../../src/models/Place');
jest.mock('node-nlp');

describe('ChatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processMessage', () => {
    it('deve processar uma mensagem e retornar resposta do chatbot', async () => {
      const userId = 1;
      const message = "Como ganhar AmaCoins?";
      const contextType = 'general';
      const contextId = null;

      // Mock dos dados
      const mockUser = {
        id: userId,
        name: 'Test User',
        amacoins: 100
      };

      const mockUserMessage = {
        id: 5,
        user_id: userId,
        message,
        is_from_user: true,
        context_type: contextType,
        context_id: contextId
      };

      const mockBotMessage = {
        id: 6,
        user_id: userId,
        message: "Você pode ganhar AmaCoins realizando check-in em eventos e locais turísticos, além de responder corretamente aos quizzes disponíveis.",
        is_from_user: false,
        context_type: contextType,
        context_id: contextId
      };

      // Mock das funções
      User.findById.mockResolvedValue(mockUser);
      ChatMessage.create
        .mockResolvedValueOnce(mockUserMessage)  // Primeira chamada - mensagem do usuário
        .mockResolvedValueOnce(mockBotMessage);  // Segunda chamada - resposta do bot

      // Mock da função process do NLP
      chatbotService.nlp = {
        process: jest.fn().mockResolvedValue({
          intent: 'amacoins.ganhar',
          score: 0.8
        }),
        renderAnswer: jest.fn().mockResolvedValue("Você pode ganhar AmaCoins realizando check-in em eventos e locais turísticos, além de responder corretamente aos quizzes disponíveis.")
      };

      // Executar o método
      const result = await chatbotService.processMessage(userId, message, contextType, contextId);

      // Verificações
      expect(ChatMessage.create).toHaveBeenCalledTimes(2);
      expect(chatbotService.nlp.process).toHaveBeenCalledWith(message);
      expect(result).toEqual({
        userMessage: mockUserMessage,
        botMessage: mockBotMessage
      });
    });

    it('deve verificar o contexto se fornecido', async () => {
      const userId = 1;
      const message = "Detalhes deste evento?";
      const contextType = 'event';
      const contextId = 5;

      // Mock dos dados
      const mockEvent = {
        id: contextId,
        name: 'Evento de Teste',
        description: 'Descrição do evento de teste'
      };

      // Mock das funções
      Event.findById.mockResolvedValue(mockEvent);
      ChatMessage.create.mockResolvedValue({});  // Simplificado para o teste
      
      chatbotService.nlp = {
        process: jest.fn().mockResolvedValue({ score: 0 }),
        renderAnswer: jest.fn()
      };

      // Monkeypatch para getKeywordBasedResponse
      const originalGetKeywordBasedResponse = chatbotService.getKeywordBasedResponse;
      chatbotService.getKeywordBasedResponse = jest.fn().mockReturnValue("Resposta baseada em palavras-chave");
      
      // Executar o método
      await chatbotService.processMessage(userId, message, contextType, contextId);

      // Verificações
      expect(Event.findById).toHaveBeenCalledWith(contextId);
      
      // Restaurar função original
      chatbotService.getKeywordBasedResponse = originalGetKeywordBasedResponse;
    });

    it('deve lançar erro para contexto inválido', async () => {
      const userId = 1;
      const message = "Olá";
      const contextType = 'event';
      const contextId = 999;  // ID inexistente

      // Mock das funções
      Event.findById.mockResolvedValue(null);  // Evento não encontrado

      // Executar o método e verificar se o erro é lançado
      await expect(chatbotService.processMessage(userId, message, contextType, contextId))
        .rejects.toThrow('Contexto não encontrado');
      
      expect(Event.findById).toHaveBeenCalledWith(contextId);
      expect(ChatMessage.create).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('deve retornar histórico de mensagens', async () => {
      const userId = 1;
      const mockMessages = [
        { 
          id: 1, 
          user_id: userId,
          message: "Olá",
          is_from_user: true
        },
        { 
          id: 2, 
          user_id: userId,
          message: "Olá! Como posso ajudar?",
          is_from_user: false
        }
      ];

      // Mock da função findByUserId
      ChatMessage.findByUserId.mockResolvedValue(mockMessages);

      // Executar o método
      const result = await chatbotService.getHistory(userId);

      // Verificações
      expect(ChatMessage.findByUserId).toHaveBeenCalledWith(userId, {}, 1, 20);
      expect(result).toEqual(mockMessages);
    });

    it('deve aplicar filtros corretamente', async () => {
      const userId = 1;
      const filters = {
        context_type: 'event',
        context_id: 5
      };
      const page = 2;
      const limit = 15;

      const mockMessages = [
        { 
          id: 10, 
          user_id: userId,
          message: "Detalhes deste evento?",
          is_from_user: true,
          context_type: 'event',
          context_id: 5
        }
      ];

      // Mock da função findByUserId
      ChatMessage.findByUserId.mockResolvedValue(mockMessages);

      // Executar o método
      const result = await chatbotService.getHistory(userId, filters, page, limit);

      // Verificações
      expect(ChatMessage.findByUserId).toHaveBeenCalledWith(userId, filters, page, limit);
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getKeywordBasedResponse', () => {
    it('deve retornar resposta baseada em palavra-chave para AmaCoins', () => {
      const message = "Como funcionam os AmaCoins?";
      
      // Executar o método
      const result = chatbotService.getKeywordBasedResponse(message);

      // Verificações
      expect(result).toContain("AmaCoins são a moeda virtual da AmazôniaExperience");
    });

    it('deve retornar resposta padrão para mensagem sem palavras-chave conhecidas', () => {
      const message = "Algo completamente aleatório";
      
      // Executar o método
      const result = chatbotService.getKeywordBasedResponse(message);

      // Verificações
      expect(result).toContain("Não consegui entender completamente sua pergunta");
    });
  });
});