export const up = function(knex) {
  return knex.schema.createTable('quiz_questions', (table) => {
    table.increments('id').primary();
    table.integer('quiz_id').unsigned().notNullable();
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.text('question_text').notNullable();
    table.enum('question_type', ['multiple_choice', 'true_false', 'open_ended']).notNullable();
    table.json('options'); // Para múltipla escolha
    table.string('correct_answer').notNullable();
    table.integer('question_order').defaultTo(1);
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('quiz_questions');
};
