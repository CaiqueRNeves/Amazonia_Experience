/**
 * Utilitários para operações geográficas
 * Contém funções para cálculos de distância, conversão de coordenadas, etc.
 */

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do primeiro ponto
 * @param {number} lon1 - Longitude do primeiro ponto
 * @param {number} lat2 - Latitude do segundo ponto
 * @param {number} lon2 - Longitude do segundo ponto
 * @param {string} unit - Unidade de medida ('K' para km, 'M' para milhas, 'N' para milhas náuticas)
 * @returns {number} Distância entre os pontos na unidade especificada
 */
export const calculateDistance = (lat1, lon1, lat2, lon2, unit = 'K') => {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  }
  
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
             Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515; // Distância em milhas
  
  if (unit === 'K') {
    dist = dist * 1.609344; // Converte para km
  } else if (unit === 'N') {
    dist = dist * 0.8684; // Converte para milhas náuticas
  }
  
  return dist;
};

/**
 * Verifica se um ponto está dentro de um raio de um centro
 * @param {Object} center - Coordenadas do centro {latitude, longitude}
 * @param {Object} point - Coordenadas do ponto a verificar {latitude, longitude}
 * @param {number} radiusKm - Raio em quilômetros
 * @returns {boolean} True se o ponto estiver dentro do raio
 */
export const isPointWithinRadius = (center, point, radiusKm) => {
  if (!center || !point) return false;
  
  const distance = calculateDistance(
    center.latitude,
    center.longitude,
    point.latitude,
    point.longitude,
    'K'
  );
  
  return distance <= radiusKm;
};

/**
 * Converte coordenadas decimais para o formato graus, minutos e segundos
 * @param {number} decimal - Coordenada decimal
 * @param {boolean} isLatitude - Se a coordenada é uma latitude
 * @returns {string} Coordenada no formato DMS (graus, minutos e segundos)
 */
export const decimalToDMS = (decimal, isLatitude) => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);
  
  const direction = isLatitude
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
};

/**
 * Converte coordenadas em formato DMS para decimal
 * @param {number} degrees - Graus
 * @param {number} minutes - Minutos
 * @param {number} seconds - Segundos
 * @param {string} direction - Direção (N, S, E, W)
 * @returns {number} Coordenada decimal
 */
export const DMSToDecimal = (degrees, minutes, seconds, direction) => {
  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
};

/**
 * Obtém o centro geográfico de um conjunto de pontos
 * @param {Array} points - Array de pontos {latitude, longitude}
 * @returns {Object} Coordenadas do centro {latitude, longitude}
 */
export const getCenterOfPoints = (points) => {
  if (!points || !points.length) {
    return null;
  }
  
  let sumLat = 0;
  let sumLng = 0;
  
  for (const point of points) {
    sumLat += point.latitude;
    sumLng += point.longitude;
  }
  
  return {
    latitude: sumLat / points.length,
    longitude: sumLng / points.length
  };
};

/**
 * Ordena pontos por distância de um centro
 * @param {Object} center - Coordenadas do centro {latitude, longitude}
 * @param {Array} points - Array de pontos com coordenadas
 * @returns {Array} Pontos ordenados por distância do centro
 */
export const sortPointsByDistance = (center, points) => {
  if (!center || !points || !points.length) {
    return [];
  }
  
  return [...points].sort((a, b) => {
    const distA = calculateDistance(
      center.latitude,
      center.longitude,
      a.latitude,
      a.longitude,
      'K'
    );
    
    const distB = calculateDistance(
      center.latitude,
      center.longitude,
      b.latitude,
      b.longitude,
      'K'
    );
    
    return distA - distB;
  });
};

/**
 * Gera um link para o Google Maps com as coordenadas
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} label - Etiqueta para o marcador (opcional)
 * @returns {string} URL do Google Maps
 */
export const getGoogleMapsLink = (latitude, longitude, label = '') => {
  const query = label 
    ? `${latitude},${longitude}(${encodeURIComponent(label)})`
    : `${latitude},${longitude}`;
  
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

/**
 * Converte coordenadas para o formato aceito pela API do OpenStreetMap
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {string} Coordenadas no formato do OpenStreetMap
 */
export const getOpenStreetMapLink = (latitude, longitude) => {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
};

/**
 * Busca o endereço a partir das coordenadas (geocodificação reversa)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} Promessa com o endereço
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    
    const data = await response.json();
    
    return {
      success: true,
      address: data.display_name,
      details: data.address
    };
  } catch (error) {
    console.error('Erro ao obter endereço das coordenadas:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  calculateDistance,
  isPointWithinRadius,
  decimalToDMS,
  DMSToDecimal,
  getCenterOfPoints,
  sortPointsByDistance,
  getGoogleMapsLink,
  getOpenStreetMapLink,
  getAddressFromCoordinates
};