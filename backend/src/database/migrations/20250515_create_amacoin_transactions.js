export const up = function(knex) {
  return knex.schema.createTable('amacoin_transactions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.integer('amount').notNullable(); // Pode ser negativo para débitos
    table.integer('previous_balance').notNullable();
    table.integer('new_balance').notNullable();
    table.enum('transaction_type', ['credit', 'debit', 'transfer_in', 'transfer_out', 'redemption', 'refund']).notNullable();
    table.string('related_entity_type'); // 'visit', 'quiz', 'reward', etc.
    table.integer('related_entity_id');
    table.integer('related_user_id'); // Para transferências
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('amacoin_transactions');
};
