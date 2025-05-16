const db = require('../config/database');

class ChatMessage {
  // Métodos de busca
  static findById(id) {
    return db('chat_messages').where({ id }).first();
  }

  // Criar mensagem
  static async create(messageData) {
    const [id] = await db('chat_messages').insert(messageData);
    return this.findById(id);
  }

  // Buscar mensagens por usuário
  static findByUserId(userId, filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let query = db('chat_messages').where({ user_id: userId });
    
    // Aplicar filtros adicionais
    if (filters.context_type) {
      query = query.where('context_type', filters.context_type);
      
      if (filters.context_id) {
        query = query.where('context_id', filters.context_id);
      }
    }
    
    return query
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at');
  }

  // Atualizar feedback
  static async updateFeedback(id, isHelpful, feedbackText) {
    await db('chat_messages').where({ id }).update({
      is_helpful: isHelpful,
      feedback_text: feedbackText,
      feedback_at: new Date()
    });
    
    return this.findById(id);
  }
}

module.exports = ChatMessage;