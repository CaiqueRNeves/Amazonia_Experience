const jwt = require('jsonwebtoken');

/**
 * Gera token JWT de acesso
 * @param {Object} payload - Dados a serem incluídos no token
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
};

/**
 * Gera refresh token
 * @param {Object} payload - Dados a serem incluídos no token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

/**
 * Verifica refresh token
 * @param {string} token - Token a ser verificado
 * @returns {Object|null} Dados decodificados ou null se inválido
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verifica token de acesso
 * @param {string} token - Token a ser verificado
 * @returns {Object|null} Dados decodificados ou null se inválido
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken
};