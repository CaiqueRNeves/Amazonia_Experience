// Validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar coordenadas geográficas
const isValidCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  return !isNaN(lat) && !isNaN(lng) &&
         lat >= -90 && lat <= 90 &&
         lng >= -180 && lng <= 180;
};

// Verificar se uma string contém apenas caracteres alfanuméricos e espaços
const isAlphanumericWithSpaces = (str) => {
  return /^[a-zA-Z0-9\s]+$/.test(str);
};

// Sanitizar string para prevenir SQL injection
const sanitizeSQLInput = (str) => {
  if (!str) return str;
  return String(str)
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\');
};

// Sanitizar string para uso em HTML (prevenir XSS)
const sanitizeHtmlInput = (str) => {
  if (!str) return str;
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Validar se a data está no formato ISO
const isValidISODate = (dateString) => {
  try {
    return Boolean(new Date(dateString).toISOString());
  } catch (e) {
    return false;
  }
};

// Verificar se um objeto tem todas as propriedades requeridas
const hasRequiredProperties = (obj, requiredProps) => {
  return requiredProps.every(prop => obj.hasOwnProperty(prop) && obj[prop] !== null && obj[prop] !== undefined);
};

module.exports = {
  isValidEmail,
  isValidCoordinates,
  isAlphanumericWithSpaces,
  sanitizeSQLInput,
  sanitizeHtmlInput,
  isValidISODate,
  hasRequiredProperties
};