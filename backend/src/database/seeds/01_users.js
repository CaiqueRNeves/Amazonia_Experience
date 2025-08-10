import bcrypt from '../../utils/password.js';

export const seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('users').del();
  
  // Cria senhas hasheadas
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('password123', 10);
  const partnerPasswordHash = await bcrypt.hash('partner123', 10);
  
  // Insere os usuários
  return knex('users').insert([
    {
      id: 1,
      name: 'Administrador',
      email: 'admin@amazonia-experience.com',
      password: adminPasswordHash,
      nationality: 'Brasil',
      role: 'admin',
      amacoins: 1000,
      quiz_points: 500,
      notification_preferences: JSON.stringify({
        events: true,
        rewards: true,
        quizzes: true,
        emergency: true
      }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Maria Silva',
      email: 'maria@example.com',
      password: userPasswordHash,
      nationality: 'Brasil',
      role: 'user',
      amacoins: 150,
      quiz_points: 75,
      notification_preferences: JSON.stringify({
        events: true,
        rewards: true,
        quizzes: false,
        emergency: true
      }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'John Doe',
      email: 'john@example.com',
      password: userPasswordHash,
      nationality: 'United States',
      role: 'user',
      amacoins: 80,
      quiz_points: 40,
      notification_preferences: JSON.stringify({
        events: true,
        rewards: true,
        quizzes: true,
        emergency: true
      }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Restaurante Amazônico',
      email: 'contato@restauranteamazonico.com',
      password: partnerPasswordHash,
      nationality: 'Brasil',
      role: 'partner',
      amacoins: 0,
      quiz_points: 0,
      notification_preferences: JSON.stringify({
        events: false,
        rewards: true,
        quizzes: false,
        emergency: true
      }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Artesanato Regional',
      email: 'contato@artesanatoregional.com',
      password: partnerPasswordHash,
      nationality: 'Brasil',
      role: 'partner',
      amacoins: 0,
      quiz_points: 0,
      notification_preferences: JSON.stringify({
        events: false,
        rewards: true,
        quizzes: false,
        emergency: true
      }),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};