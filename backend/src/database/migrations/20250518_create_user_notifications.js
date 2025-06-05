export const up = function(knex) {
  return knex.schema.createTable('user_notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.string('type').notNullable(); // redemption_success, visit_verified, etc.
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.json('data'); // Dados adicionais da notificação
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('user_notifications');
};