export const up = function(knex) {
  return knex.schema.createTable('connectivity_spots', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('address').notNullable();
    table.float('latitude').notNullable();
    table.float('longitude').notNullable();
    table.enum('wifi_speed', ['slow', 'medium', 'fast', 'unknown']).defaultTo('unknown');
    table.boolean('is_free').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.float('avg_signal_strength'); // 1-10
    table.float('working_percentage'); // 0-100
    table.timestamp('last_updated');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('connectivity_spots');
};