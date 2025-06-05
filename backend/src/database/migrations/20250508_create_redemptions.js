export const up = function(knex) {
  return knex.schema.createTable('redemptions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.integer('reward_id').unsigned().notNullable();
    table.foreign('reward_id').references('id').inTable('rewards');
    table.integer('amacoins_spent').notNullable();
    table.string('redemption_code').unique().notNullable();
    table.timestamp('redeemed_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at');
    table.timestamp('cancelled_at');
    table.enum('status', ['pending', 'completed', 'cancelled']).defaultTo('pending');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('redemptions');
};