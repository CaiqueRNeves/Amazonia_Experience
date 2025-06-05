export const up = function(knex) {
  return knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.string('location').notNullable();
    table.float('latitude').notNullable();
    table.float('longitude').notNullable();
    table.enum('event_type', ['conference', 'panel', 'workshop', 'exhibition', 'cultural', 'social']).notNullable();
    table.integer('amacoins_value').notNullable().defaultTo(20);
    table.integer('max_capacity');
    table.integer('current_attendance').defaultTo(0);
    table.boolean('is_featured').defaultTo(false);
    table.string('image_url');
    table.string('registration_link');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('events');
};