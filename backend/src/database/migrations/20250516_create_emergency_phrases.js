export const up = function(knex) {
  return knex.schema.createTable('emergency_phrases', (table) => {
    table.increments('id').primary();
    table.string('language', 10).notNullable(); // pt-BR, en-US, etc.
    table.string('category').notNullable(); // help, medical, police, etc.
    table.text('phrase_text').notNullable();
    table.text('translation_text');
    table.text('pronunciation_guide');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('emergency_phrases');
};