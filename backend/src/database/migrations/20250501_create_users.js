exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('nationality');
    table.enum('role', ['user', 'partner', 'admin']).defaultTo('user');
    table.integer('amacoins').defaultTo(0);
    table.integer('quiz_points').defaultTo(0);
    table.json('notification_preferences').defaultTo(JSON.stringify({
      events: true,
      rewards: true,
      quizzes: true,
      emergency: true
    }));
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};