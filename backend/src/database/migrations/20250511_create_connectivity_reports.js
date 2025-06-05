export const up = function(knex) {
  return knex.schema.createTable('connectivity_reports', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.integer('spot_id').unsigned().notNullable();
    table.foreign('spot_id').references('id').inTable('connectivity_spots');
    table.enum('wifi_speed', ['slow', 'medium', 'fast']);
    table.integer('wifi_reliability'); // 1-10
    table.boolean('is_working');
    table.string('comment', 500);
    table.timestamp('reported_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('connectivity_reports');
};
