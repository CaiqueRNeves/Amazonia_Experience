/**
 * Funções utilitárias para validação de dados
 * Contém validadores para email, senha, nome, etc.
 */

/**
 * Valida um endereço de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se o email for válido
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Expressão regular para validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida uma senha com base em critérios de segurança
 * @param {string} password - Senha a ser validada
 * @param {Object} options - Opções de validação
 * @returns {boolean} True se a senha for válida
 */
export const isValidPassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options;
  
  if (!password || password.length < minLength) {
    return false;
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }
  
  if (requireNumbers && !/[0-9]/.test(password)) {
    return false;
  }
  
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }
  
  return true;
};

/**
 * Valida um nome (verifica se não está vazio e tem tamanho mínimo)
 * @param {string} name - Nome a ser validado
 * @param {number} minLength - Tamanho mínimo requerido
 * @returns {boolean} True se o nome for válido
 */
export const isValidName = (name, minLength = 3) => {
  return Boolean(name && name.trim().length >= minLength);
};

/**
 * Valida se duas senhas coincidem
 * @param {string} password - Senha
 * @param {string} confirmPassword - Confirmação da senha
 * @returns {boolean} True se as senhas coincidirem
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Valida coordenadas geográficas
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True se as coordenadas forem válidas
 */
export const isValidCoordinates = (latitude, longitude) => {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }
  
  const lat = Number(latitude);
  const lng = Number(longitude);
  
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Valida um número de telefone
 * @param {string} phone - Número de telefone
 * @returns {boolean} True se o telefone for válido
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const phoneNumbers = phone.replace(/\D/g, '');
  
  // Verifica se tem pelo menos 10 dígitos (DDD + número)
  return phoneNumbers.length >= 10;
};

/**
 * Valida um CEP brasileiro
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} True se o CEP for válido
 */
export const isValidCEP = (cep) => {
  if (!cep) return false;
  
  // Remove caracteres não numéricos
  const cepNumbers = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  return cepNumbers.length === 8;
};

/**
 * Valida um CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} True se o CNPJ for válido
 */
export const isValidCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]+/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  // Primeiro dígito verificador
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};

/**
 * Verifica se uma string é vazia ou contém apenas espaços
 * @param {string} value - Valor a ser verificado
 * @returns {boolean} True se a string for vazia ou contiver apenas espaços
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || value.trim() === '';
};

/**
 * Valida se um valor está dentro de um intervalo
 * @param {number} value - Valor a ser validado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} True se o valor estiver dentro do intervalo
 */
export const isInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export default {
  isValidEmail,
  isValidPassword,
  isValidName,
  doPasswordsMatch,
  isValidCoordinates,
  isValidPhone,
  isValidCEP,
  isValidCNPJ,
  isEmpty,
  isInRange
};