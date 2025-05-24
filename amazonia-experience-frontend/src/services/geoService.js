import errorService from './errorService';

/**
 * Serviço para operações relacionadas à geolocalização
 * Gerencia posição do usuário, cálculo de distâncias e geocodificação
 */
const geoService = {
  /**
   * Obtém a posição atual do usuário
   * @param {Object} options - Opções para a geolocalização
   * @returns {Promise<Position>} Objeto de posição
   */
  async getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocalização não suportada pelo navegador');
        errorService.logError({
          message: 'Geolocalização não suportada',
          error,
          category: errorService.categories.GEOLOCATION
        });
        reject(error);
        return;
      }

      // Configurações padrão
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,  // 10 segundos
        maximumAge: 60000 // 1 minuto
      };

      // Mescla as opções padrão com as fornecidas
      const geoOptions = { ...defaultOptions, ...options };

      // Solicita a posição atual
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          const errorMessage = errorService.getGeolocationErrorMessage(error.code);
          errorService.logError({
            message: errorMessage,
            error,
            category: errorService.categories.GEOLOCATION
          });
          reject(error);
        },
        geoOptions
      );
    });
  },

  /**
   * Inicia observação contínua da posição do usuário
   * @param {Function} successCallback - Função chamada quando a posição é atualizada
   * @param {Function} errorCallback - Função chamada em caso de erro
   * @param {Object} options - Opções para a geolocalização
   * @returns {number} ID do observador para uso posterior
   */
  watchPosition(successCallback, errorCallback, options = {}) {
    if (!navigator.geolocation) {
      const error = new Error('Geolocalização não suportada pelo navegador');
      errorService.logError({
        message: 'Geolocalização não suportada',
        error,
        category: errorService.categories.GEOLOCATION
      });
      
      if (errorCallback) {
        errorCallback(error);
      }
      return null;
    }

    // Configurações padrão
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,  // 10 segundos
      maximumAge: 5000 // 5 segundos
    };

    // Mescla as opções padrão com as fornecidas
    const geoOptions = { ...defaultOptions, ...options };

    // Função de erro com tratamento
    const handleError = (error) => {
      const errorMessage = errorService.getGeolocationErrorMessage(error.code);
      errorService.logError({
        message: errorMessage,
        error,
        category: errorService.categories.GEOLOCATION
      });
      
      if (errorCallback) {
        errorCallback(error);
      }
    };

    // Inicia o observador
    return navigator.geolocation.watchPosition(
      successCallback,
      handleError,
      geoOptions
    );
  },

  /**
   * Para a observação da posição
   * @param {number} watchId - ID do observador retornado por watchPosition
   */
  clearWatch(watchId) {
    if (navigator.geolocation && watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  /**
   * Calcula a distância entre dois pontos geográficos usando a fórmula de Haversine
   * @param {number} lat1 - Latitude do primeiro ponto
   * @param {number} lon1 - Longitude do primeiro ponto
   * @param {number} lat2 - Latitude do segundo ponto
   * @param {number} lon2 - Longitude do segundo ponto
   * @returns {number} Distância em quilômetros
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  },

  /**
   * Converte graus para radianos
   * @param {number} degrees - Ângulo em graus
   * @returns {number} Ângulo em radianos
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  /**
   * Verifica se duas posições estão próximas
   * @param {Object} pos1 - Primeira posição { latitude, longitude }
   * @param {Object} pos2 - Segunda posição { latitude, longitude }
   * @param {number} maxDistance - Distância máxima em metros
   * @returns {boolean} Verdadeiro se estiverem próximas
   */
  isNearby(pos1, pos2, maxDistance = 500) {
    const distance = this.calculateDistance(
      pos1.latitude, 
      pos1.longitude, 
      pos2.latitude, 
      pos2.longitude
    );
    
    // Converter km para metros (distância retornada por calculateDistance é em km)
    return (distance * 1000) <= maxDistance;
  },

  /**
   * Formata coordenadas para exibição ao usuário
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {string} format - Formato ('decimal' ou 'dms')
   * @returns {string} Coordenadas formatadas
   */
  formatCoordinates(latitude, longitude, format = 'decimal') {
    if (format === 'dms') {
      return `${this.decimalToDMS(latitude, 'lat')}, ${this.decimalToDMS(longitude, 'lon')}`;
    }
    
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  },

  /**
   * Converte coordenadas decimais para graus, minutos e segundos (DMS)
   * @param {number} decimal - Coordenada decimal
   * @param {string} type - Tipo de coordenada ('lat' ou 'lon')
   * @returns {string} Coordenada em formato DMS
   */
  decimalToDMS(decimal, type) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
    
    let direction = '';
    if (type === 'lat') {
      direction = decimal >= 0 ? 'N' : 'S';
    } else {
      direction = decimal >= 0 ? 'E' : 'W';
    }
    
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  },

  /**
   * Valida coordenadas geográficas
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {boolean} Verdadeiro se as coordenadas forem válidas
   */
  validateCoordinates(latitude, longitude) {
    // Verifica se são números
    if (isNaN(latitude) || isNaN(longitude)) {
      return false;
    }
    
    // Verifica limites
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return false;
    }
    
    return true;
  },

  /**
   * Verifica se a geolocalização é suportada pelo navegador
   * @returns {boolean} Verdadeiro se suportado
   */
  isGeolocationSupported() {
    return !!navigator.geolocation;
  },

  /**
   * Verifica se a API de alta precisão é suportada
   * @returns {boolean} Verdadeiro se suportado
   */
  isHighAccuracySupported() {
    // A API Geolocation não tem detecção direta de suporte para alta precisão,
    // então usamos uma verificação baseada em recursos de dispositivos móveis
    return (
      'DeviceOrientationEvent' in window ||
      'DeviceMotionEvent' in window ||
      'Gyroscope' in window
    );
  }
};

export default geoService;