export const up = function(knex) {
  return knex.schema.createTable('partners', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.string('business_name').notNullable();
    table.enum('business_type', ['event_organizer', 'tourist_spot', 'shop', 'restaurant', 'app_service']).notNullable();
    table.string('address').notNullable();
    table.string('contact_phone');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('partners');
};