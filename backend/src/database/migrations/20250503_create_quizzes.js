export const up = function(knex) {
  return knex.schema.createTable('quizzes', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.enum('difficulty', ['easy', 'medium', 'hard']).notNullable();
    table.string('topic').notNullable();
    table.integer('amacoins_reward').notNullable().defaultTo(20);
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('quizzes');
};
