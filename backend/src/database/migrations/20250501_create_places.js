exports.up = function(knex) {
  return knex.schema.createTable('places', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.string('address').notNullable();
    table.float('latitude').notNullable();
    table.float('longitude').notNullable();
    table.enum('type', ['tourist_spot', 'restaurant', 'shop', 'cultural_venue']).notNullable();
    table.integer('amacoins_value').notNullable().defaultTo(10);
    table.integer('partner_id').unsigned();
    table.foreign('partner_id').references('id').inTable('partners');
    table.string('image_url');
    table.string('opening_hours');
    table.boolean('wifi_available').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('places');
};