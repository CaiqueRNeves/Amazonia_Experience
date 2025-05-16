const Place = require('../models/Place');
const Partner = require('../models/Partner');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const EmergencyService = require('../models/EmergencyService');
const ConnectivitySpot = require('../models/ConnectivitySpot');
const { NotFoundError, ValidationError } = require('../middleware/error');

// Criar local
exports.createPlace = async (req, res, next) => {
  try {
    const placeData = req.body;
    
    // Se um parceiro foi especificado, verificar se existe
    if (placeData.partner_id) {
      const partner = await Partner.findById(placeData.partner_id);
      if (!partner) {
        throw new ValidationError('Parceiro não encontrado');
      }
    }
    
    const place = await Place.create(placeData);
    
    res.status(201).json({
      status: 'success',
      data: {
        place
      }
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar local
exports.updatePlace = async (req, res, next) => {
  try {
    const placeId = req.params.id;
    const placeData = req.body;
    
    // Verificar se o local existe
    const place = await Place.findById(placeId);
    if (!place) {
      throw new NotFoundError('Local não encontrado');
    }
    
    // Se um parceiro foi especificado, verificar se existe
    if (placeData.partner_id) {
      const partner = await Partner.findById(placeData.partner_id);
      if (!partner) {
        throw new ValidationError('Parceiro não encontrado');
      }
    }
    
    const updatedPlace = await Place.update(placeId, placeData);
    
    res.json({
      status: 'success',
      data: {
        place: updatedPlace
      }
    });
  } catch (error) {
    next(error);
  }
};

// Criar parceiro
exports.createPartner = async (req, res, next) => {
  try {
    const { user_id, business_name, business_type, address, contact_phone } = req.body;
    
    // Verificar se o usuário existe
    const user = await User.findById(user_id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    // Verificar se o usuário já é um parceiro
    if (user.role === 'partner') {
      throw new ValidationError('Este usuário já é um parceiro');
    }
    
    // Criar entrada na tabela de parceiros
    const partner = await Partner.create({
      user_id,
      business_name,
      business_type,
      address,
      contact_phone,
      created_at: new Date()
    });
    
    // Atualizar função do usuário para parceiro
    await User.update(user_id, { role: 'partner' });
    
    res.status(201).json({
      status: 'success',
      data: {
        partner
      }
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar função de usuário
exports.updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    
    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    // Atualizar função do usuário
    const updatedUser = await User.update(userId, { role });
    
    res.json({
      status: 'success',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Criar novo quiz
exports.createQuiz = async (req, res, next) => {
  try {
    const { title, description, difficulty, topic, amacoins_reward, questions } = req.body;
    
    // Criar quiz
    const quiz = await Quiz.create({
      title,
      description,
      difficulty,
      topic,
      amacoins_reward,
      created_at: new Date()
    });
    
    // Adicionar perguntas ao quiz
    for (const questionData of questions) {
      await Quiz.addQuestion(quiz.id, questionData);
    }
    
    // Buscar quiz completo com perguntas
    const createdQuiz = await Quiz.findById(quiz.id);
    const createdQuestions = await Quiz.getQuestions(quiz.id);
    
    res.status(201).json({
      status: 'success',
      data: {
        quiz: createdQuiz,
        questions: createdQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar quiz existente
exports.updateQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.id;
    const quizData = req.body;
    
    // Verificar se o quiz existe
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new NotFoundError('Quiz não encontrado');
    }
    
    // Atualizar dados básicos do quiz
    if (quizData.title || quizData.description || quizData.difficulty || 
        quizData.topic || quizData.amacoins_reward) {
      
      const updateData = {};
      if (quizData.title) updateData.title = quizData.title;
      if (quizData.description) updateData.description = quizData.description;
      if (quizData.difficulty) updateData.difficulty = quizData.difficulty;
      if (quizData.topic) updateData.topic = quizData.topic;
      if (quizData.amacoins_reward) updateData.amacoins_reward = quizData.amacoins_reward;
      
      await Quiz.update(quizId, updateData);
    }
    
    // Atualizar perguntas, se fornecidas
    if (quizData.questions) {
      // Opção 1: Remover todas as perguntas e adicionar novas
      // await Quiz.deleteAllQuestions(quizId);
      // for (const questionData of quizData.questions) {
      //   await Quiz.addQuestion(quizId, questionData);
      // }
      
      // Opção 2: Atualizar perguntas existentes e adicionar novas
      for (const questionData of quizData.questions) {
        if (questionData.id) {
          // Atualizar pergunta existente
          await Quiz.updateQuestion(questionData.id, questionData);
        } else {
          // Adicionar nova pergunta
          await Quiz.addQuestion(quizId, questionData);
        }
      }
    }
    
    // Buscar quiz atualizado
    const updatedQuiz = await Quiz.findById(quizId);
    const updatedQuestions = await Quiz.getQuestions(quizId);
    
    res.json({
      status: 'success',
      data: {
        quiz: updatedQuiz,
        questions: updatedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// Adicionar serviço de emergência
exports.addEmergencyService = async (req, res, next) => {
  try {
    const serviceData = req.body;
    
    // Formatar array de idiomas falados, se necessário
    if (serviceData.languages_spoken && !Array.isArray(serviceData.languages_spoken)) {
      serviceData.languages_spoken = [serviceData.languages_spoken];
    }
    
    // Criar serviço de emergência
    const service = await EmergencyService.create(serviceData);
    
    res.status(201).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar informações de pontos de conectividade
exports.updateConnectivitySpot = async (req, res, next) => {
  try {
    const { id, ...spotData } = req.body;
    
    // Verificar se o ponto de conectividade existe
    const spot = await ConnectivitySpot.findById(id);
    if (!spot) {
      throw new NotFoundError('Ponto de conectividade não encontrado');
    }
    
    // Atualizar ponto de conectividade
    const updatedSpot = await ConnectivitySpot.update(id, spotData);
    
    res.json({
      status: 'success',
      data: {
        spot: updatedSpot
      }
    });
  } catch (error) {
    next(error);
  }
};