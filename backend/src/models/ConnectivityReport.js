import db from '../config/database.js';

class ConnectivityReport {
  // Métodos de busca
  static findById(id) {
    return db('connectivity_reports').where({ id }).first();
  }

  // Criar relatório
  static async create(reportData) {
    const [id] = await db('connectivity_reports').insert({
      ...reportData,
      created_at: new Date(),
      updated_at: new Date()
    });
    return this.findById(id);
  }

  // Buscar relatórios por usuário
  static findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('connectivity_reports')
      .where({ user_id: userId })
      .join('connectivity_spots', 'connectivity_reports.spot_id', '=', 'connectivity_spots.id')
      .select(
        'connectivity_reports.*',
        'connectivity_spots.name as spot_name',
        'connectivity_spots.address as spot_address'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('connectivity_reports.reported_at', 'desc');
  }

  // Buscar relatórios por ponto de conectividade
  static findBySpotId(spotId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    return db('connectivity_reports')
      .where({ spot_id: spotId })
      .join('users', 'connectivity_reports.user_id', '=', 'users.id')
      .select(
        'connectivity_reports.*',
        'users.name as user_name'
      )
      .limit(limit)
      .offset(offset)
      .orderBy('connectivity_reports.reported_at', 'desc');
  }

  // Obter estatísticas por ponto de conectividade
  static async getStatsBySpotId(spotId) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const stats = await db('connectivity_reports')
      .where({ spot_id: spotId })
      .where('reported_at', '>=', lastMonth)
      .select(
        db.raw('COUNT(*) as total_reports'),
        db.raw('COUNT(DISTINCT user_id) as unique_users'),
        db.raw('AVG(wifi_reliability) as avg_reliability'),
        db.raw(`
          SUM(CASE WHEN wifi_speed = 'slow' THEN 1 ELSE 0 END) as slow_count,
          SUM(CASE WHEN wifi_speed = 'medium' THEN 1 ELSE 0 END) as medium_count,
          SUM(CASE WHEN wifi_speed = 'fast' THEN 1 ELSE 0 END) as fast_count
        `),
        db.raw('SUM(CASE WHEN is_working = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as working_percentage')
      )
      .first();
    
    return stats;
  }
}

export default ConnectivityReport;