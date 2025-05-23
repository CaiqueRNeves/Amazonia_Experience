/* eslint-disable no-unused-vars */
const Partner = require('../models/Partner');
const { NotFoundError, ValidationError } = require('../middleware/error');

// Listar parceiros
exports.getPartners = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const filters = {};
    
    if (req.query.business_type) {
      filters.businessType = req.query.business_type;
    }
    
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    const partners = await Partner.findAll(page, limit, filters);
    
    res.json({
      status: 'success',
      data: {
        partners,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter recompensas de um parceiro
exports.getPartnerRewards = async (req, res, next) => {
  try {
    const partnerId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Verificar se o parceiro existe
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      throw new NotFoundError('Parceiro não encontrado');
    }
    
    const rewards = await Partner.getRewards(partnerId, page, limit);
    
    res.json({
      status: 'success',
      data: {
        rewards,
        pagination: {
          page,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verificar código de visita
exports.verifyCode = async (req, res, next) => {
  try {
    const { verification_code } = req.body;
    const userId = req.user.id;
    
    const result = await Partner.verifyVisitCode(userId, verification_code);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};