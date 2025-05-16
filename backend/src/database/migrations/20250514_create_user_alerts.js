exports.up = function(knex) {
  return knex.schema.createTable('user_alerts', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.enum('alert_type', ['event_reminder', 'quiz_available', 'system_notification', 'emergency_alert']).notNullable();
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.string('related_entity_type');
    table.integer('related_entity_id');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('scheduled_for').notNullable();
    table.timestamp('expires_at');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_alerts');
};