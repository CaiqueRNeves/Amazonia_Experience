export const up = function(knex) {
  return knex.schema.createTable('quiz_attempts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.integer('quiz_id').unsigned().notNullable();
    table.foreign('quiz_id').references('id').inTable('quizzes');
    table.timestamp('started_at').notNullable();
    table.timestamp('completed_at');
    table.timestamp('expires_at').notNullable();
    table.enum('status', ['in_progress', 'completed', 'expired']).defaultTo('in_progress');
    table.integer('score'); // Porcentagem
    table.integer('amacoins_earned').defaultTo(0);
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('quiz_attempts');
};
