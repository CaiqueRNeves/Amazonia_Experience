export const seed = async function(knex) {
  // Deleta todos os registros existentes
  await knex('events').del();
  
  // Data atual para referência de tempo
  const now = new Date();
  
  // Criar datas para eventos
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  const dayAfterTomorrow = new Date(now);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);
  
  // Insere os eventos
  return knex('events').insert([
    {
      id: 1,
      name: 'Cerimônia de Abertura da COP30',
      description: 'Cerimônia oficial de abertura da 30ª Conferência das Partes da Convenção-Quadro das Nações Unidas sobre Mudança do Clima (COP30).',
      start_time: tomorrow,
      end_time: new Date(tomorrow.getTime() + (4 * 60 * 60 * 1000)), // +4 horas
      location: 'Hangar Centro de Convenções',
      latitude: -1.4271,
      longitude: -48.4547,
      event_type: 'conference',
      amacoins_value: 50,
      max_capacity: 5000,
      current_attendance: 0,
      is_featured: true,
      image_url: 'https://example.com/images/abertura_cop30.jpg',
      registration_link: 'https://cop30.gov.br/inscricao/abertura',
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      name: 'Painel: Desafios da Bioeconomia na Amazônia',
      description: 'Painel de discussão sobre os desafios e oportunidades da bioeconomia na região amazônica, com foco em práticas sustentáveis e cadeias produtivas.',
      start_time: dayAfterTomorrow,
      end_time: new Date(dayAfterTomorrow.getTime() + (2 * 60 * 60 * 1000)), // +2 horas
      location: 'Teatro da Paz',
      latitude: -1.4523,
      longitude: -48.4884,
      event_type: 'panel',
      amacoins_value: 30,
      max_capacity: 800,
      current_attendance: 0,
      is_featured: true,
      image_url: 'https://example.com/images/painel_bioeconomia.jpg',
      registration_link: 'https://cop30.gov.br/inscricao/bioeconomia',
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      name: 'Workshop: Soluções Baseadas na Natureza',
      description: 'Workshop prático sobre implementação de soluções baseadas na natureza para mitigação e adaptação às mudanças climáticas.',
      start_time: new Date(dayAfterTomorrow.getTime() + (5 * 60 * 60 * 1000)), // Mesmo dia, +5 horas
      end_time: new Date(dayAfterTomorrow.getTime() + (8 * 60 * 60 * 1000)), // +8 horas
      location: 'Museu Paraense Emílio Goeldi',
      latitude: -1.4534,
      longitude: -48.4751,
      event_type: 'workshop',
      amacoins_value: 25,
      max_capacity: 100,
      current_attendance: 0,
      is_featured: false,
      image_url: 'https://example.com/images/workshop_solucoes.jpg',
      registration_link: 'https://cop30.gov.br/inscricao/workshop-sbn',
      created_at: now,
      updated_at: now
    },
    {
      id: 4,
      name: 'Exposição: Biodiversidade Amazônica',
      description: 'Exposição interativa sobre a rica biodiversidade da Amazônia, destacando a importância de sua conservação no contexto das mudanças climáticas.',
      start_time: tomorrow,
      end_time: new Date(nextWeek.getTime() + (7 * 24 * 60 * 60 * 1000)), // Dura uma semana
      location: 'Parque Zoobotânico do Museu Goeldi',
      latitude: -1.4513,
      longitude: -48.4742,
      event_type: 'exhibition',
      amacoins_value: 15,
      max_capacity: null, // Sem limite de capacidade
      current_attendance: 0,
      is_featured: true,
      image_url: 'https://example.com/images/exposicao_biodiversidade.jpg',
      registration_link: null, // Não requer inscrição
      created_at: now,
      updated_at: now
    },
    {
      id: 5,
      name: 'Workshop: Bioeconomia e Conhecimentos Tradicionais',
      description: 'Workshop sobre a integração de conhecimentos tradicionais nas cadeias produtivas sustentáveis da Amazônia.',
      start_time: new Date(now.getTime() + (2 * 60 * 60 * 1000)), // 2 horas a partir de agora
      end_time: new Date(now.getTime() + (5 * 60 * 60 * 1000)), // 5 horas a partir de agora
      location: 'Museu Paraense Emílio Goeldi',
      latitude: -1.4534,
      longitude: -48.4751,
      event_type: 'workshop',
      amacoins_value: 20,
      max_capacity: 80,
      current_attendance: 10,
      is_featured: false,
      image_url: 'https://example.com/images/workshop_conhecimentos.jpg',
      registration_link: 'https://cop30.gov.br/inscricao/workshop-tradicional',
      created_at: now,
      updated_at: now
    }
  ]);
};