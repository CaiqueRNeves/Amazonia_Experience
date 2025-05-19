const knex = require('knex');
const config = require('../../knexfile');
const errorService = require('./errorService');

/**
 * Serviço para gerenciamento de conexão com banco de dados
 * Fornece instância configurada do Knex e funções utilitárias para banco de dados
 */
const databaseService = {
  /**
   * Instância do Knex configurada para o ambiente atual
   */
  knex: null,

  /**
   * Inicializa a conexão com o banco de dados
   * @returns {Object} Instância do Knex configurada
   */
  init() {
    try {
      const environment = process.env.NODE_ENV || 'development';
      this.knex = knex(config[environment]);
      
      // Log de inicialização bem-sucedida
      console.log(`Conexão com banco de dados inicializada (ambiente: ${environment})`);
      
      return this.knex;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao inicializar conexão com banco de dados',
        error
      });
      
      throw error;
    }
  },

  /**
   * Obtém a instância do Knex para uso em queries
   * @returns {Object} Instância do Knex
   */
  getKnex() {
    if (!this.knex) {
      return this.init();
    }
    
    return this.knex;
  },

  /**
   * Verifica a saúde da conexão com o banco de dados
   * @returns {Promise<boolean>} Verdadeiro se a conexão estiver saudável
   */
  async healthCheck() {
    try {
      const knexInstance = this.getKnex();
      await knexInstance.raw('SELECT 1');
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao verificar saúde da conexão com banco de dados',
        error
      });
      
      return false;
    }
  },

  /**
   * Encerra a conexão com o banco de dados
   * @returns {Promise<boolean>} Verdadeiro se a conexão foi encerrada com sucesso
   */
  async close() {
    try {
      if (this.knex) {
        await this.knex.destroy();
        this.knex = null;
        console.log('Conexão com banco de dados encerrada');
      }
      
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao encerrar conexão com banco de dados',
        error
      });
      
      return false;
    }
  },

  /**
   * Executa uma transação no banco de dados
   * @param {Function} callback - Função que recebe a transação como parâmetro
   * @returns {Promise<any>} Resultado da transação
   */
  async transaction(callback) {
    const knexInstance = this.getKnex();
    return knexInstance.transaction(callback);
  },

  /**
   * Executa uma migração do banco de dados
   * @param {string} direction - Direção da migração ('up' ou 'down')
   * @param {Object} config - Configurações adicionais para a migração
   * @returns {Promise<boolean>} Verdadeiro se a migração foi bem-sucedida
   */
  async migrate(direction = 'up', config = {}) {
    try {
      const knexInstance = this.getKnex();
      
      if (direction === 'up') {
        await knexInstance.migrate.latest(config);
      } else if (direction === 'down') {
        await knexInstance.migrate.rollback(config);
      } else {
        throw new Error(`Direção de migração inválida: ${direction}`);
      }
      
      console.log(`Migração '${direction}' concluída com sucesso`);
      return true;
    } catch (error) {
      errorService.logError({
        message: `Erro ao executar migração '${direction}'`,
        error
      });
      
      return false;
    }
  },

  /**
   * Executa uma seed do banco de dados
   * @param {Object} config - Configurações adicionais para a seed
   * @returns {Promise<boolean>} Verdadeiro se a seed foi bem-sucedida
   */
  async seed(config = {}) {
    try {
      const knexInstance = this.getKnex();
      await knexInstance.seed.run(config);
      
      console.log('Seed concluída com sucesso');
      return true;
    } catch (error) {
      errorService.logError({
        message: 'Erro ao executar seed',
        error
      });
      
      return false;
    }
  },

  /**
   * Sanitiza uma string para prevenir SQL Injection
   * @param {string} str - String a ser sanitizada
   * @returns {string} String sanitizada
   */
  sanitizeSQLInput(str) {
    if (!str) return str;
    
    return String(str)
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\');
  },

  /**
   * Obtém informações sobre o schema do banco de dados
   * @param {string} tableName - Nome da tabela (opcional)
   * @returns {Promise<Object>} Informações do schema
   */
  async getSchemaInfo(tableName = null) {
    try {
      const knexInstance = this.getKnex();
      
      if (tableName) {
        // Obtém informações de uma tabela específica
        const columns = await knexInstance.table(tableName).columnInfo();
        return { [tableName]: columns };
      } else {
        // Lista todas as tabelas
        let tables;
        
        // Diferentes comandos dependendo do banco de dados
        if (config.client === 'pg' || config.client === 'postgres') {
          tables = await knexInstance.raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
          tables = tables.rows.map(row => row.table_name);
        } else if (config.client === 'mysql' || config.client === 'mysql2') {
          tables = await knexInstance.raw('SHOW TABLES');
          tables = tables[0].map(row => Object.values(row)[0]);
        } else {
          // SQLite e outros
          tables = await knexInstance.raw("SELECT name FROM sqlite_master WHERE type='table'");
          tables = tables.map(row => row.name);
        }
        
        // Filtrar tabelas internas do banco
        tables = tables.filter(name => !name.startsWith('sqlite_') && !name.startsWith('knex_'));
        
        // Obter informações de cada tabela
        const schema = {};
        
        for (const table of tables) {
          schema[table] = await knexInstance.table(table).columnInfo();
        }
        
        return schema;
      }
    } catch (error) {
      errorService.logError({
        message: `Erro ao obter informações do schema${tableName ? ` para tabela ${tableName}` : ''}`,
        error
      });
      
      throw error;
    }
  }
};

// Exportar a instância do Knex para uso direto
module.exports = databaseService.getKnex();