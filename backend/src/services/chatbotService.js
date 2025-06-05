/* eslint-disable no-case-declarations */
/* eslint-disable quotes */
/* eslint-disable max-len */
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Place from '../models/Place.js';
import EmergencyService from '../models/EmergencyService.js';
import ConnectivitySpot from '../models/ConnectivitySpot.js';
import { ValidationError, NotFoundError } from '../middleware/error.js';
import { NlpManager } from 'node-nlp';

/**
 * Serviço responsável pelo processamento de mensagens do chatbot
 */
class ChatbotService {
  constructor() {
    this.nlp = new NlpManager({ languages: ['pt', 'en'], forceNER: true });
    this.initializeNLP();
  }

  /**
   * Inicializa o processador de linguagem natural
   */
  async initializeNLP() {
    // Adicionar intenções e frases para treinamento
    // Português
    this.nlp.addDocument('pt', 'qual é o próximo evento', 'eventos.proximos');
    this.nlp.addDocument('pt', 'quando é o próximo evento', 'eventos.proximos');
    this.nlp.addDocument('pt', 'programação de eventos', 'eventos.programacao');
    this.nlp.addDocument('pt', 'onde vão acontecer os eventos', 'eventos.locais');
    this.nlp.addDocument('pt', 'o que é amacoins', 'amacoins.explicacao');
    this.nlp.addDocument('pt', 'como ganhar amacoins', 'amacoins.ganhar');
    this.nlp.addDocument('pt', 'onde gastar amacoins', 'amacoins.gastar');
    this.nlp.addDocument('pt', 'qual meu saldo de amacoins', 'amacoins.saldo');
    this.nlp.addDocument('pt', 'onde tem wifi', 'conectividade.wifi');
    this.nlp.addDocument('pt', 'problemas com conectividade', 'conectividade.problemas');
    this.nlp.addDocument('pt', 'números de emergência', 'emergencia.numeros');
    this.nlp.addDocument('pt', 'hospitais próximos', 'emergencia.hospitais');
    this.nlp.addDocument('pt', 'farmácias abertas', 'emergencia.farmacias');
    this.nlp.addDocument('pt', 'como fazer check-in', 'app.checkin');
    this.nlp.addDocument('pt', 'como resgatar recompensas', 'app.recompensas');
    
    // Inglês
    this.nlp.addDocument('en', 'when is the next event', 'eventos.proximos');
    this.nlp.addDocument('en', 'event schedule', 'eventos.programacao');
    this.nlp.addDocument('en', 'where are the events taking place', 'eventos.locais');
    this.nlp.addDocument('en', 'what are amacoins', 'amacoins.explicacao');
    this.nlp.addDocument('en', 'how to earn amacoins', 'amacoins.ganhar');
    this.nlp.addDocument('en', 'where to spend amacoins', 'amacoins.gastar');
    this.nlp.addDocument('en', 'what is my amacoins balance', 'amacoins.saldo');
    this.nlp.addDocument('en', 'where is wifi available', 'conectividade.wifi');
    this.nlp.addDocument('en', 'connectivity issues', 'conectividade.problemas');
    this.nlp.addDocument('en', 'emergency numbers', 'emergencia.numeros');
    this.nlp.addDocument('en', 'nearby hospitals', 'emergencia.hospitais');
    this.nlp.addDocument('en', 'open pharmacies', 'emergencia.farmacias');
    this.nlp.addDocument('en', 'how to check in', 'app.checkin');
    this.nlp.addDocument('en', 'how to redeem rewards', 'app.recompensas');
    
    // Adicionar respostas
    this.nlp.addAnswer('pt', 'eventos.proximos', 'O próximo evento é "{{proximoEvento}}". Acontecerá em {{localEvento}} às {{horaEvento}}.');
    this.nlp.addAnswer('pt', 'eventos.programacao', 'Você pode encontrar a programação completa de eventos na aba "Eventos" do aplicativo.');
    this.nlp.addAnswer('pt', 'eventos.locais', 'Os eventos da COP30 ocorrerão em diversos locais de Belém. Você pode ver todos no mapa da aba "Eventos".');
    this.nlp.addAnswer('pt', 'amacoins.explicacao', 'AmaCoins são a moeda virtual da AmazôniaExperience. Você pode ganhar AmaCoins visitando locais, participando de eventos e completando quizzes.');
    this.nlp.addAnswer('pt', 'amacoins.ganhar', 'Você pode ganhar AmaCoins realizando check-in em eventos e locais turísticos, além de responder corretamente aos quizzes disponíveis.');
    this.nlp.addAnswer('pt', 'amacoins.gastar', 'Você pode trocar seus AmaCoins por produtos e serviços de parceiros locais na aba "Recompensas" do aplicativo.');
    this.nlp.addAnswer('pt', 'amacoins.saldo', 'Seu saldo atual é de {{saldoAmacoins}} AmaCoins.');
    this.nlp.addAnswer('pt', 'conectividade.wifi', 'Você pode encontrar pontos de WiFi gratuito na aba "Conectividade" do aplicativo.');
    this.nlp.addAnswer('pt', 'conectividade.problemas', 'Se estiver tendo problemas com conectividade, tente encontrar um dos pontos de WiFi marcados no mapa da aba "Conectividade".');
    this.nlp.addAnswer('pt', 'emergencia.numeros', 'Números de emergência no Brasil: Polícia (190), Ambulância (192), Bombeiros (193).');
    this.nlp.addAnswer('pt', 'emergencia.hospitais', 'Você pode encontrar hospitais próximos na aba "Emergência" do aplicativo.');
    this.nlp.addAnswer('pt', 'emergencia.farmacias', 'Você pode encontrar farmácias abertas na aba "Emergência" do aplicativo, filtrando por "Farmácia".');
    this.nlp.addAnswer('pt', 'app.checkin', 'Para fazer check-in, vá até a página do evento ou local e clique no botão "Check-in". Você precisará estar fisicamente no local para concluir o processo.');
    this.nlp.addAnswer('pt', 'app.recompensas', 'Para resgatar recompensas, acesse a aba "Recompensas", escolha o item desejado e clique em "Resgatar". O código será gerado automaticamente.');
    
    // Inglês
    this.nlp.addAnswer('en', 'eventos.proximos', 'The next event is "{{proximoEvento}}". It will take place at {{localEvento}} at {{horaEvento}}.');
    this.nlp.addAnswer('en', 'eventos.programacao', 'You can find the complete schedule of events in the "Events" tab of the app.');
    this.nlp.addAnswer('en', 'eventos.locais', 'COP30 events will take place at various locations in Belém. You can see all of them on the map in the "Events" tab.');
    this.nlp.addAnswer('en', 'amacoins.explicacao', 'AmaCoins are the virtual currency of AmazôniaExperience. You can earn AmaCoins by visiting places, participating in events, and completing quizzes.');
    this.nlp.addAnswer('en', 'amacoins.ganhar', 'You can earn AmaCoins by checking in at events and tourist spots, as well as correctly answering the available quizzes.');
    this.nlp.addAnswer('en', 'amacoins.gastar', 'You can exchange your AmaCoins for products and services from local partners in the "Rewards" tab of the app.');
    this.nlp.addAnswer('en', 'amacoins.saldo', 'Your current balance is {{saldoAmacoins}} AmaCoins.');
    this.nlp.addAnswer('en', 'conectividade.wifi', 'You can find free WiFi spots in the "Connectivity" tab of the app.');
    this.nlp.addAnswer('en', 'conectividade.problemas', 'If you are having connectivity issues, try finding one of the WiFi spots marked on the map in the "Connectivity" tab.');
    this.nlp.addAnswer('en', 'emergencia.numeros', 'Emergency numbers in Brazil: Police (190), Ambulance (192), Fire Department (193).');
    this.nlp.addAnswer('en', 'emergencia.hospitais', 'You can find nearby hospitals in the "Emergency" tab of the app.');
    this.nlp.addAnswer('en', 'emergencia.farmacias', 'You can find open pharmacies in the "Emergency" tab of the app, filtering by "Pharmacy".');
    this.nlp.addAnswer('en', 'app.checkin', 'To check in, go to the event or place page and click the "Check-in" button. You will need to be physically at the location to complete the process.');
    this.nlp.addAnswer('en', 'app.recompensas', 'To redeem rewards, go to the "Rewards" tab, choose the desired item, and click "Redeem". The code will be generated automatically.');
    
    // Treinar o modelo
    await this.nlp.train();
  }

  /**
   * Processa uma mensagem e retorna a resposta do chatbot
   */
  async processMessage(userId, message, contextType = 'general', contextId = null) {
    // Verificar contexto se fornecido
    if (contextType !== 'general' && contextId) {
      await this.verifyContext(contextType, contextId);
    }
    
    // Salvar mensagem do usuário
    const userMessage = await ChatMessage.create({
      user_id: userId,
      message,
      is_from_user: true,
      context_type: contextType,
      context_id: contextId
    });
    
    // Processar mensagem com NLP
    let botResponse = "Desculpe, ainda não consigo processar essa pergunta.";
    
    try {
      // Obter usuário para informações contextuais
      const user = await User.findById(userId);
      
      // Detectar idioma e intenção
      const result = await this.nlp.process(message);
      
      if (result.intent && result.score > 0.7) {
        // Customizar resposta com dados do usuário ou contexto quando necessário
        const variables = {};
        
        if (result.intent === 'amacoins.saldo') {
          variables.saldoAmacoins = user.amacoins;
        }
        
        if (result.intent === 'eventos.proximos') {
          const proximoEvento = await this.getProximoEvento();
          if (proximoEvento) {
            variables.proximoEvento = proximoEvento.name;
            variables.localEvento = proximoEvento.location;
            
            const hora = new Date(proximoEvento.start_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            variables.horaEvento = hora;
          }
        }
        
        // Obter resposta baseada na intenção detectada
        botResponse = await this.nlp.renderAnswer(result.locales[0], result.intent, variables);
      } else {
        // Fallback para respostas simples baseadas em palavras-chave
        botResponse = this.getKeywordBasedResponse(message);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      botResponse = "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.";
    }
    
    // Salvar resposta do chatbot
    const botMessage = await ChatMessage.create({
      user_id: userId,
      message: botResponse,
      is_from_user: false,
      context_type: contextType,
      context_id: contextId
    });
    
    return {
      userMessage,
      botMessage
    };
  }

  /**
   * Verifica se um contexto existe
   */
  async verifyContext(contextType, contextId) {
    let contextExists = false;
    
    switch (contextType) {
    case 'event':
      const event = await Event.findById(contextId);
      contextExists = !!event;
      break;
    case 'place':
      const place = await Place.findById(contextId);
      contextExists = !!place;
      break;
    case 'emergency':
      const emergencyService = await EmergencyService.findById(contextId);
      contextExists = !!emergencyService;
      break;
    case 'connectivity':
      const connectivitySpot = await ConnectivitySpot.findById(contextId);
      contextExists = !!connectivitySpot;
      break;
    case 'general':
      contextExists = true;
      break;
    default:
      throw new ValidationError('Tipo de contexto inválido');
    }
    
    if (!contextExists) {
      throw new NotFoundError('Contexto não encontrado');
    }
  }

  /**
   * Obtém o próximo evento
   */
  async getProximoEvento() {
    const now = new Date();
    
    // Buscar o próximo evento que ainda não começou
    const eventos = await Event.findAll(1, 1, { startDate: now });
    
    if (eventos && eventos.length > 0) {
      return eventos[0];
    }
    
    return null;
  }

  /**
   * Obtém uma resposta baseada em palavras-chave simples
   */
  getKeywordBasedResponse(message) {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('evento') || lowercaseMessage.includes('event')) {
      return "Você pode encontrar todos os eventos da COP30 na seção 'Eventos'. Utilize os filtros para encontrar eventos específicos ou procure por eventos próximos a você.";
    } else if (lowercaseMessage.includes('amacoins')) {
      return "AmaCoins são a moeda virtual da AmazôniaExperience. Você pode ganhar AmaCoins visitando locais, participando de eventos e completando quizzes. Os AmaCoins podem ser trocados por produtos e serviços de parceiros locais.";
    } else if (lowercaseMessage.includes('conectividade') || lowercaseMessage.includes('wifi')) {
      return "Você pode encontrar pontos de WiFi na seção 'Conectividade'. A maioria dos locais oficiais da COP30 possui conexão WiFi gratuita.";
    } else if (lowercaseMessage.includes('emergência') || lowercaseMessage.includes('emergency')) {
      return "Em caso de emergência, acesse a seção 'Emergência' para encontrar hospitais, farmácias, delegacias e outros serviços próximos. Ligue para 190 (Polícia) ou 192 (SAMU) em casos de emergência.";
    } else if (lowercaseMessage.includes('olá') || lowercaseMessage.includes('oi') || lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
      return "Olá! Sou o assistente virtual da AmazôniaExperience. Como posso ajudar você durante a COP30?";
    } else if (lowercaseMessage.includes('obrigado') || lowercaseMessage.includes('thanks') || lowercaseMessage.includes('thank you')) {
      return "Disponha! Estou aqui para ajudar. Se tiver mais alguma dúvida, é só perguntar!";
    } else if (lowercaseMessage.includes('quiz') || lowercaseMessage.includes('quizzes')) {
      return "Os quizzes são uma forma divertida de aprender sobre a Amazônia e ganhar AmaCoins. Você pode encontrá-los na seção 'Quizzes' do aplicativo.";
    } else if (lowercaseMessage.includes('parceiro') || lowercaseMessage.includes('loja') || lowercaseMessage.includes('artesanato') || lowercaseMessage.includes('shop')) {
      return "Temos diversos parceiros locais onde você pode trocar seus AmaCoins por produtos e serviços. Confira a seção 'Recompensas' para ver todas as opções disponíveis.";
    }
    
    // Resposta padrão
    return "Não consegui entender completamente sua pergunta. Posso ajudar com informações sobre eventos, AmaCoins, conectividade, emergências, quizzes e parceiros da COP30.";
  }

  /**
   * Obtém o histórico de conversas
   */
  async getHistory(userId, filters = {}, page = 1, limit = 20) {
    return ChatMessage.findByUserId(userId, filters, page, limit);
  }

  /**
   * Salva feedback sobre uma resposta do chatbot
   */
  async saveFeedback(messageId, isHelpful, feedbackText) {
    return ChatMessage.updateFeedback(messageId, isHelpful, feedbackText);
  }
}

export default new ChatbotService();