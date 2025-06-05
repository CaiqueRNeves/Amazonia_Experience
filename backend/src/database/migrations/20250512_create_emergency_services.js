export const up = function(knex) {
  return knex.schema.createTable('emergency_services', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.enum('service_type', ['hospital', 'pharmacy', 'police', 'fire_department', 'embassy', 'tourist_police']).notNullable();
    table.string('address').notNullable();
    table.float('latitude').notNullable();
    table.float('longitude').notNullable();
    table.string('phone_number').notNullable();
    table.string('alternative_phone');
    table.string('opening_hours');
    table.boolean('is_24h').defaultTo(false);
    table.json('languages_spoken').defaultTo(JSON.stringify(['pt-BR'])); // Array de idiomas disponíveis
    table.text('additional_info');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('emergency_services');
};