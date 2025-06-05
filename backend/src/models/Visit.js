import db from '../config/database.js';
import User from './User.js';
import Event from './Event.js';
import Place from './Place.js';
import { ValidationError } from '../middleware/error.js';
import crypto from 'crypto';

class Visit {
  // Métodos de busca
  static findById(id) {
    return db('visits').where({ id }).first();
  }
  
  static findByVerificationCode(code) {
    return db('visits').where({ verification_code: code }).first();
  }

  // Criar registro de visita
  static async create(visitData) {
    // Verificar se o usuário existe
    const user = await User.findById(visitData.user_id);
    if (!user) {
      throw new ValidationError('Usuário não encontrado');
    }

    // Verificar se o local ou evento existe
    if (visitData.place_id) {
      const place = await Place.findById(visitData.place_id);
      if (!place) {
        throw new ValidationError('Local não encontrado');
      }
    } else if (visitData.event_id) {
      const event = await Event.findById(visitData.event_id);
      if (!event) {
        throw new ValidationError('Evento não encontrado');
      }
      
      // Incrementar contador de participantes para eventos
      await Event.incrementAttendance(visitData.event_id);
    } else {
      throw new ValidationError('É necessário especificar um local ou evento');
    }

    // Gerar código de verificação único
    const verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const [id] = await db('visits').insert({
      ...visitData,
      verification_code: verificationCode,
      visited_at: visitData.visited_at || new Date()
    });

    return this.findById(id);
  }

  // Verificar uma visita
  static async verify(code) {
    const visit = await this.findByVerificationCode(code);
    if (!visit) {
      throw new ValidationError('Código de verificação inválido');
    }

    if (visit.status === 'verified') {
      throw new ValidationError('Esta visita já foi verificada');
    }

    await db('visits').where({ id: visit.id }).update({ status: 'verified' });
    
    // Creditar AmaCoins ao usuário
    await User.updateAmacoins(visit.user_id, visit.amacoins_earned);
    
    return this.findById(visit.id);
  }

  // Rejeitar uma visita
  static async reject(code, reason) {
    const visit = await this.findByVerificationCode(code);
    if (!visit) {
      throw new ValidationError('Código de verificação inválido');
    }

    await db('visits').where({ id: visit.id }).update({ 
      status: 'rejected',
      rejection_reason: reason 
    });
    
    return this.findById(visit.id);
  }

  // Listar visitas por usuário
  static getByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('visits')
      .where({ user_id: userId })
      .limit(limit)
      .offset(offset)
      .orderBy('visited_at', 'desc');
  }

  // Listar visitas por local
  static getByPlaceId(placeId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('visits')
      .where({ place_id: placeId })
      .limit(limit)
      .offset(offset)
      .orderBy('visited_at', 'desc');
  }

  // Listar visitas por evento
  static getByEventId(eventId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('visits')
      .where({ event_id: eventId })
      .limit(limit)
      .offset(offset)
      .orderBy('visited_at', 'desc');
  }
}

export default Visit;