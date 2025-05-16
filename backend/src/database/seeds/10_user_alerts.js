exports.seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('user_alerts').del();
  
  // Data atual para referência de tempo
  const now = new Date();
  
  // Calcula datas futuras baseadas na data atual
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Insere os alertas
  return knex('user_alerts').insert([
    {
      id: 1,
      user_id: 2, // Maria Silva
      alert_type: 'event_reminder',
      title: 'Cerimônia de Abertura Amanhã!',
      message: 'Não perca a Cerimônia de Abertura da COP30 amanhã às 09:00 no Hangar Centro de Convenções. Chegue com antecedência!',
      related_entity_type: 'event',
      related_entity_id: 1,
      is_read: false,
      scheduled_for: now, // Alerta atual
      expires_at: new Date(tomorrow.getTime() + (12 * 60 * 60 * 1000)), // Expira após evento começar
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      user_id: 2, // Maria Silva
      alert_type: 'quiz_available',
      title: 'Novo Quiz Disponível!',
      message: 'O novo quiz "Conhecendo a Amazônia" está disponível! Complete-o e ganhe até 50 AmaCoins.',
      related_entity_type: 'quiz',
      related_entity_id: 1,
      is_read: true,
      scheduled_for: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)), // 2 dias atrás
      expires_at: nextWeek,
      created_at: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)),
      updated_at: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000))
    },
    {
      id: 3,
      user_id: 3, // John Doe
      alert_type: 'system_notification',
      title: 'Bem-vindo à Belém!',
      message: 'Bem-vindo à Belém do Pará! Use o AmazôniaExperience para explorar a cidade e acumular AmaCoins participando de eventos da COP30 e visitando pontos turísticos.',
      related_entity_type: null,
      related_entity_id: null,
      is_read: false,
      scheduled_for: now,
      expires_at: nextWeek,
      created_at: now,
      updated_at: now
    },
    {
      id: 4,
      user_id: 3, // John Doe
      alert_type: 'event_reminder',
      title: 'Workshop em 2 horas',
      message: 'O workshop "Bioeconomia e Conhecimentos Tradicionais" começa em 2 horas no Museu Paraense Emílio Goeldi.',
      related_entity_type: 'event',
      related_entity_id: 5,
      is_read: false,
      scheduled_for: now,
      expires_at: new Date(now.getTime() + (3 * 60 * 60 * 1000)), // Expira após 3 horas
      created_at: now,
      updated_at: now
    },
    {
      id: 5,
      user_id: 2, // Maria Silva
      alert_type: 'emergency_alert',
      title: 'Alerta de Chuva Forte',
      message: 'Previsão de chuva forte para hoje à tarde. Recomendamos levar guarda-chuva e evitar áreas com histórico de alagamento.',
      related_entity_type: null,
      related_entity_id: null,
      is_read: false,
      scheduled_for: now,
      expires_at: new Date(now.getTime() + (12 * 60 * 60 * 1000)), // Expira após 12 horas
      created_at: now,
      updated_at: now
    }
  ]);
};