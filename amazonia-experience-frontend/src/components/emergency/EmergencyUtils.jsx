/**
 * Utilitários para a seção de emergência
 * Funções auxiliares específicas para componentes de emergência
 */

/**
 * Obtém a cor associada a um tipo de serviço de emergência
 * @param {string} type - Tipo de serviço
 * @returns {string} Código de cor hexadecimal
 */
export const getServiceColor = (type) => {
  switch (type) {
    case 'hospital':
      return '#E53E3E'; // Vermelho
    case 'pharmacy':
      return '#38A169'; // Verde
    case 'police':
      return '#3182CE'; // Azul
    case 'fire_department':
      return '#DD6B20'; // Laranja
    case 'embassy':
      return '#6B46C1'; // Roxo
    case 'tourist_police':
      return '#0987A0'; // Azul claro
    default:
      return '#718096'; // Cinza
  }
};

/**
 * Obtém o ícone associado a um tipo de serviço de emergência
 * @param {string} type - Tipo de serviço
 * @returns {string} Nome do ícone
 */
export const getServiceIcon = (type) => {
  switch (type) {
    case 'hospital':
      return 'medical-building';
    case 'pharmacy':
      return 'medicine-bottle';
    case 'police':
      return 'police-badge';
    case 'fire_department':
      return 'fire-truck';
    case 'embassy':
      return 'flag-banner';
    case 'tourist_police':
      return 'badge-help';
    default:
      return 'first-aid';
  }
};

/**
 * Formata o tipo de serviço para exibição localizada
 * @param {string} type - Tipo de serviço
 * @param {Function} t - Função de tradução do i18n
 * @returns {string} Tipo formatado e traduzido
 */
export const formatServiceType = (type, t) => {
  if (t) {
    return t(`emergency.serviceTypes.${type}`) || type;
  }
  
  // Fallback se não tiver função de tradução
  const types = {
    hospital: 'Hospital',
    pharmacy: 'Farmácia',
    police: 'Polícia',
    fire_department: 'Corpo de Bombeiros',
    embassy: 'Embaixada',
    tourist_police: 'Polícia Turística'
  };
  
  return types[type] || type;
};

/**
 * Formata a lista de idiomas falados
 * @param {string|Array} languages - Lista de idiomas
 * @returns {Array} Array de idiomas
 */
export const formatLanguages = (languages) => {
  if (!languages) return [];
  
  // Se for uma string JSON, tenta parsear
  if (typeof languages === 'string') {
    try {
      const parsed = JSON.parse(languages);
      return Array.isArray(parsed) ? parsed : [languages];
    } catch (e) {
      return [languages];
    }
  }
  
  // Se já for um array, retorna como está
  return Array.isArray(languages) ? languages : [languages];
};

/**
 * Verifica se um serviço está aberto no horário atual
 * @param {Object} service - Dados do serviço
 * @returns {boolean} Verdadeiro se o serviço estiver aberto
 */
export const isServiceOpen = (service) => {
  // Se o serviço funciona 24h, está sempre aberto
  if (service.is_24h) {
    return true;
  }
  
  // Se não tiver horário de funcionamento, assumir fechado
  if (!service.opening_hours) {
    return false;
  }
  
  // Implementação básica - considerar horário comercial padrão
  const now = new Date();
  const currentHour = now.getHours();
  const currentDayOfWeek = now.getDay(); // 0 (domingo) a 6 (sábado)
  
  // Verificar se é final de semana
  if ((currentDayOfWeek === 0 || currentDayOfWeek === 6) && 
      !service.opening_hours.includes('weekend')) {
    return false;
  }
  
  // Verificar horário comercial padrão (8h às 18h)
  return currentHour >= 8 && currentHour < 18;
};

/**
 * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do primeiro ponto
 * @param {number} lon1 - Longitude do primeiro ponto
 * @param {number} lat2 - Latitude do segundo ponto
 * @param {number} lon2 - Longitude do segundo ponto
 * @returns {number} Distância em quilômetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Converte graus para radianos
 * @param {number} degrees - Ângulo em graus
 * @returns {number} Ângulo em radianos
 */
export const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Formata distância para exibição
 * @param {number} distance - Distância em quilômetros
 * @returns {string} Distância formatada
 */
export const formatDistance = (distance) => {
  if (distance === undefined || distance === null) {
    return '';
  }
  
  if (typeof distance === 'string') {
    return distance;
  }
  
  // Formatar com base na distância
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else {
    return `${distance.toFixed(1)} km`;
  }
};

/**
 * Gera o conteúdo para um popup de serviço no mapa
 * @param {Object} service - Dados do serviço
 * @param {Function} t - Função de tradução do i18n
 * @returns {string} HTML do popup
 */
export const generateServicePopupContent = (service, t) => {
  if (!service) return '';
  
  const isOpen = isServiceOpen(service);
  const openText = t ? t(isOpen ? 'emergency.open' : 'emergency.closed') : (isOpen ? 'Aberto' : 'Fechado');
  const openClass = isOpen ? 'text-green-600' : 'text-red-600';
  
  return `
    <div class="emergency-popup">
      <h3 class="font-semibold">${service.name}</h3>
      <p>${formatServiceType(service.service_type, t)}</p>
      ${service.address ? `<p>${service.address}</p>` : ''}
      ${service.phone_number ? `<p>${t ? t('common.phone') : 'Telefone'}: ${service.phone_number}</p>` : ''}
      ${service.is_24h 
        ? `<p class="text-green-600">${t ? t('emergency.open24h') : 'Aberto 24h'}</p>` 
        : `<p class="${openClass}">${openText}</p>`
      }
    </div>
  `;
};

/**
 * Filtra serviços com base nos critérios
 * @param {Array} services - Lista de serviços
 * @param {Object} filters - Critérios de filtro
 * @returns {Array} Serviços filtrados
 */
export const filterServices = (services, filters = {}) => {
  if (!services || !services.length) {
    return [];
  }
  
  return services.filter(service => {
    // Filtrar por tipo
    if (filters.type && service.service_type !== filters.type) {
      return false;
    }
    
    // Filtrar por 24h
    if (filters.is24h === true && !service.is_24h) {
      return false;
    }
    
    // Filtrar por idioma
    if (filters.language && service.languages_spoken) {
      const languages = formatLanguages(service.languages_spoken);
      if (!languages.includes(filters.language)) {
        return false;
      }
    }
    
    // Filtrar por termo de busca
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      const nameMatch = service.name && service.name.toLowerCase().includes(searchTerm);
      const addressMatch = service.address && service.address.toLowerCase().includes(searchTerm);
      const typeMatch = service.service_type && formatServiceType(service.service_type).toLowerCase().includes(searchTerm);
      
      if (!nameMatch && !addressMatch && !typeMatch) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Agrupa serviços por tipo
 * @param {Array} services - Lista de serviços
 * @returns {Object} Serviços agrupados por tipo
 */
export const groupServicesByType = (services) => {
  if (!services || !services.length) {
    return {};
  }
  
  return services.reduce((groups, service) => {
    const type = service.service_type || 'other';
    
    if (!groups[type]) {
      groups[type] = [];
    }
    
    groups[type].push(service);
    return groups;
  }, {});
};

/**
 * Verifica se as coordenadas são válidas
 * @param {Object} coordinates - Coordenadas { latitude, longitude }
 * @returns {boolean} Verdadeiro se as coordenadas forem válidas
 */
export const isValidCoordinates = (coordinates) => {
  if (!coordinates) return false;
  
  const { latitude, longitude } = coordinates;
  
  if (latitude === undefined || longitude === undefined) return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

/**
 * Obtém número de telefone de emergência com base no tipo
 * @param {string} serviceType - Tipo de serviço
 * @returns {string} Número de telefone
 */
export const getEmergencyPhoneNumber = (serviceType) => {
  switch (serviceType) {
    case 'ambulance':
      return '192'; // SAMU no Brasil
    case 'police':
      return '190'; // Polícia no Brasil
    case 'fire':
      return '193'; // Bombeiros no Brasil
    case 'universal':
      return '112'; // Número universal de emergência em muitos países
    default:
      return '';
  }
};

/**
 * Formata idiomas para exibição
 * @param {Array} languages - Lista de códigos de idioma
 * @returns {string} Idiomas formatados
 */
export const formatLanguageList = (languages) => {
  if (!languages || !languages.length) return '';
  
  const languageNames = {
    'pt-BR': 'Português',
    'en-US': 'Inglês',
    'es-ES': 'Espanhol',
    'fr-FR': 'Francês',
    'de-DE': 'Alemão',
    'it-IT': 'Italiano',
    'zh-CN': 'Chinês',
    'ru-RU': 'Russo',
    'ja-JP': 'Japonês',
    'ar-SA': 'Árabe'
  };
  
  return languages
    .map(code => languageNames[code] || code)
    .join(', ');
};

export default {
  getServiceColor,
  getServiceIcon,
  formatServiceType,
  formatLanguages,
  isServiceOpen,
  calculateDistance,
  toRadians,
  formatDistance,
  generateServicePopupContent,
  filterServices,
  groupServicesByType,
  isValidCoordinates,
  getEmergencyPhoneNumber,
  formatLanguageList
};