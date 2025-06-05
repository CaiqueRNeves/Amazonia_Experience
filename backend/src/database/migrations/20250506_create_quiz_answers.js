export const up = function(knex) {
  return knex.schema.createTable('quiz_answers', (table) => {
    table.increments('id').primary();
    table.integer('attempt_id').unsigned().notNullable();
    table.foreign('attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE');
    table.integer('question_id').unsigned().notNullable();
    table.foreign('question_id').references('id').inTable('quiz_questions');
    table.string('answer').notNullable();
    table.boolean('is_correct').notNullable();
    table.timestamp('answered_at').defaultTo(knex.fn.now());
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('quiz_answers');
};