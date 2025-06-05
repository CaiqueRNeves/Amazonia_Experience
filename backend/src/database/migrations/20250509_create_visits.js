export const up = function(knex) {
  return knex.schema.createTable('visits', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.integer('place_id').unsigned();
    table.foreign('place_id').references('id').inTable('places');
    table.integer('event_id').unsigned();
    table.foreign('event_id').references('id').inTable('events');
    table.integer('amacoins_earned').notNullable().defaultTo(0);
    table.string('verification_code').unique().notNullable();
    table.enum('status', ['pending', 'verified', 'rejected']).defaultTo('pending');
    table.string('rejection_reason');
    table.timestamp('visited_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('visits');
};
