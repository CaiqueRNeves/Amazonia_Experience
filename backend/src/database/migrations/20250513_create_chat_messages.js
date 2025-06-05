export const up = function(knex) {
  return knex.schema.createTable('chat_messages', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.text('message').notNullable();
    table.boolean('is_from_user').defaultTo(true);
    table.enum('context_type', ['general', 'event', 'place', 'emergency', 'connectivity']);
    table.integer('context_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('chat_messages');
};