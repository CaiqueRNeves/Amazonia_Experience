export const up = function(knex) {
  return knex.schema.createTable('rewards', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.enum('reward_type', ['physical_product', 'digital_service', 'discount_coupon']).notNullable();
    table.integer('amacoins_cost').notNullable();
    table.integer('stock').defaultTo(0);
    table.integer('max_per_user');
    table.integer('partner_id').unsigned();
    table.foreign('partner_id').references('id').inTable('partners');
    table.string('image_url');
    table.boolean('is_active').defaultTo(true);
    table.date('expiration_date');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('rewards');
};