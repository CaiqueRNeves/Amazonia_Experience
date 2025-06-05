import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Place from '../models/Place.js';
import EmergencyService from '../models/EmergencyService.js';
import ConnectivitySpot from '../models/ConnectivitySpot.js';
import { NotFoundError, ValidationError } from '../middleware/error.js';

// Enviar mensagem para o chatbot
export const sendMessage = async (req, res, next) => {
  try {
    const { message, context_type, context_id } = req.body;
    const userId = req.user.id;

    // Verificar contexto se fornecido
    if (context_type && context_id) {
      let contextExists = false;

      switch (context_type) {
      case 'event':
        const event = await Event.findById(context_id);
        contextExists = !!event;
        break;
      case 'place':
        const place = await Place.findById(context_id);
        contextExists = !!place;
        break;
      case 'emergency':
        const emergencyService = await EmergencyService.findById(context_id);
        contextExists = !!emergencyService;
        break;
      case 'connectivity':
        const connectivitySpot = await ConnectivitySpot.findById(context_id);
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

    // Salvar mensagem do usuário
    const userMessage = await ChatMessage.create({
      user_id: userId,
      message,
      is_from_user: true,
      context_type: context_type || 'general',
      context_id: context_id || null,
    });

    // Simular processamento do chatbot (integração NLP real seria implementada no serviço)
    let botResponse = 'Desculpe, ainda não consigo processar essa pergunta.';

    // Lógica básica de resposta com palavras-chave
    if (message.toLowerCase().includes('evento') || message.toLowerCase().includes('event')) {
      botResponse =
        "Você pode encontrar todos os eventos da COP30 na seção 'Eventos'. Utilize os filtros para encontrar eventos específicos ou procure por eventos próximos a você.";
    } else if (message.toLowerCase().includes('amacoins')) {
      botResponse =
        'AmaCoins são a moeda virtual da AmazôniaExperience. Você pode ganhar AmaCoins visitando locais, participando de eventos e completando quizzes. Os AmaCoins podem ser trocados por produtos e serviços de parceiros locais.';
    } else if (
      message.toLowerCase().includes('conectividade') ||
      message.toLowerCase().includes('wifi')
    ) {
      botResponse =
        "Você pode encontrar pontos de WiFi na seção 'Conectividade'. A maioria dos locais oficiais da COP30 possui conexão WiFi gratuita.";
    } else if (
      message.toLowerCase().includes('emergência') ||
      message.toLowerCase().includes('emergency')
    ) {
      botResponse =
        "Em caso de emergência, acesse a seção 'Emergência' para encontrar hospitais, farmácias, delegacias e outros serviços próximos. Ligue para 190 (Polícia) ou 192 (SAMU) em casos de emergência.";
    } else if (
      message.toLowerCase().includes('olá') ||
      message.toLowerCase().includes('oi') ||
      message.toLowerCase().includes('hello') ||
      message.toLowerCase().includes('hi')
    ) {
      botResponse =
        'Olá! Sou o assistente virtual da AmazôniaExperience. Como posso ajudar você durante a COP30?';
    } else if (
      message.toLowerCase().includes('obrigado') ||
      message.toLowerCase().includes('thanks') ||
      message.toLowerCase().includes('thank you')
    ) {
      botResponse =
        'Disponha! Estou aqui para ajudar. Se tiver mais alguma dúvida, é só perguntar!';
    }

    // Salvar resposta do chatbot
    const botMessage = await ChatMessage.create({
      user_id: userId,
      message: botResponse,
      is_from_user: false,
      context_type: context_type || 'general',
      context_id: context_id || null,
    });

    res.status(200).json({
      status: 'success',
      data: {
        userMessage,
        botMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Obter histórico de conversas
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const contextType = req.query.context_type;
    const contextId = req.query.context_id;

    const query = { user_id: userId };

    if (contextType) {
      query.context_type = contextType;

      if (contextId) {
        query.context_id = contextId;
      }
    }

    const messages = await ChatMessage.findByUserId(userId, query, page, limit);

    res.json({
      status: 'success',
      data: {
        messages,
        pagination: {
          page,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Obter informações contextuais para um local ou evento
export const getContext = async (req, res, next) => {
  try {
    const { entity_type, entity_id } = req.params;

    if (!['event', 'place', 'emergency', 'connectivity'].includes(entity_type)) {
      throw new ValidationError('Tipo de entidade inválido');
    }

    let contextData = null;

    switch (entity_type) {
    case 'event':
      const event = await Event.findById(entity_id);
      if (!event) {
        throw new NotFoundError('Evento não encontrado');
      }
      contextData = {
        name: event.name,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        type: 'event',
      };
      break;
    case 'place':
      const place = await Place.findById(entity_id);
      if (!place) {
        throw new NotFoundError('Local não encontrado');
      }
      contextData = {
        name: place.name,
        description: place.description,
        address: place.address,
        type: 'place',
      };
      break;
    case 'emergency':
      const emergencyService = await EmergencyService.findById(entity_id);
      if (!emergencyService) {
        throw new NotFoundError('Serviço de emergência não encontrado');
      }
      contextData = {
        name: emergencyService.name,
        service_type: emergencyService.service_type,
        address: emergencyService.address,
        phone_number: emergencyService.phone_number,
        type: 'emergency',
      };
      break;
    case 'connectivity':
      const connectivitySpot = await ConnectivitySpot.findById(entity_id);
      if (!connectivitySpot) {
        throw new NotFoundError('Ponto de conectividade não encontrado');
      }
      contextData = {
        name: connectivitySpot.name,
        wifi_speed: connectivitySpot.wifi_speed,
        is_free: connectivitySpot.is_free,
        type: 'connectivity',
      };
      break;
    }

    res.json({
      status: 'success',
      data: {
        context: contextData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Enviar feedback sobre resposta do chatbot
export const sendFeedback = async (req, res, next) => {
  try {
    const { message_id, is_helpful, feedback_text } = req.body;
    const userId = req.user.id;

    // Verificar se a mensagem existe e pertence ao bot
    const message = await ChatMessage.findById(message_id);
    if (!message) {
      throw new NotFoundError('Mensagem não encontrada');
    }

    if (message.is_from_user || message.user_id !== userId) {
      throw new ValidationError('Feedback só pode ser enviado para mensagens do chatbot');
    }

    // Atualizar feedback da mensagem
    await ChatMessage.updateFeedback(message_id, is_helpful, feedback_text);

    res.json({
      status: 'success',
      message: 'Feedback enviado com sucesso',
    });
  } catch (error) {
    next(error);
  }
};
