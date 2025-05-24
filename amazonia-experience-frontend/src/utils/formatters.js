/**
 * Funções utilitárias para formatação de dados
 * Contém funções para formatação de data, moeda, coordenadas, etc.
 */

/**
 * Formata uma data para exibição no padrão brasileiro
 * @param {Date|string} date - Data a ser formatada
 * @param {boolean} includeTime - Se deve incluir o horário
 * @returns {string} Data formatada
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
  
  return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
};

/**
 * Formata uma data no padrão relativo (ex: Hoje, Há 5 horas, etc.)
 * @param {Date|string} date - Data a ser formatada
 * @param {string} locale - Localização para a formatação
 * @returns {string} Data formatada em formato relativo
 */
export const formatRelativeDate = (date, locale = 'pt-BR') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('Data inválida:', date);
    return '';
  }
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj - now) / 1000);
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(Math.floor(diffInSeconds), 'second');
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, 'day');
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (Math.abs(diffInWeeks) < 4) {
    return rtf.format(diffInWeeks, 'week');
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return rtf.format(diffInYears, 'year');
};

/**
 * Formata um valor monetário no padrão brasileiro
 * @param {number} value - Valor a ser formatado
 * @param {string} currency - Código da moeda (ex: 'BRL')
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (value, currency = 'BRL') => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formata um número no padrão brasileiro
 * @param {number} value - Número a ser formatado
 * @param {number} decimalPlaces - Número de casas decimais
 * @returns {string} Número formatado
 */
export const formatNumber = (value, decimalPlaces = 2) => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
};

/**
 * Formata coordenadas geográficas
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {boolean} compact - Se deve usar formato compacto
 * @returns {string} Coordenadas formatadas
 */
export const formatCoordinates = (latitude, longitude, compact = false) => {
  if (latitude === null || longitude === null) return '';
  
  if (compact) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
  
  // Formato completo com graus, minutos e segundos
  const formatCoord = (coord) => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = Math.floor(((absolute - degrees) * 60 - minutes) * 60);
    return `${degrees}° ${minutes}' ${seconds}"`;
  };
  
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const lngDirection = longitude >= 0 ? 'E' : 'W';
  
  return `${formatCoord(latitude)} ${latDirection}, ${formatCoord(longitude)} ${lngDirection}`;
};

/**
 * Formata uma distância em metros ou quilômetros
 * @param {number} distanceInMeters - Distância em metros
 * @param {boolean} useAbbreviation - Se deve usar abreviações (m, km)
 * @returns {string} Distância formatada
 */
export const formatDistance = (distanceInMeters, useAbbreviation = true) => {
  if (distanceInMeters === null || distanceInMeters === undefined) return '';
  
  if (distanceInMeters < 1000) {
    // Menos de 1km, mostrar em metros
    const meters = Math.round(distanceInMeters);
    return useAbbreviation ? `${meters}m` : `${meters} metros`;
  } else {
    // Mais de 1km, mostrar em quilômetros com 1 casa decimal
    const kilometers = distanceInMeters / 1000;
    const formattedKm = (Math.round(kilometers * 10) / 10).toFixed(1);
    return useAbbreviation ? `${formattedKm}km` : `${formattedKm} quilômetros`;
  }
};

/**
 * Formata um nome para exibição com iniciais ou nome completo
 * @param {string} name - Nome completo
 * @param {boolean} initialsOnly - Se deve retornar apenas as iniciais
 * @returns {string} Nome formatado
 */
export const formatName = (name, initialsOnly = false) => {
  if (!name) return '';
  
  if (initialsOnly) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export default {
  formatDate,
  formatRelativeDate,
  formatCurrency,
  formatNumber,
  formatCoordinates,
  formatDistance,
  formatName
};