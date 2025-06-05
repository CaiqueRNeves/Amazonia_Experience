export const up = function(knex) {
  return knex.schema.createTable('emergency_contacts', (table) => {
    table.increments('id').primary();
    table.string('language', 10).notNullable(); // pt-BR, en-US, etc.
    table.json('contacts').notNullable(); // JSON com os contatos
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('emergency_contacts');
};