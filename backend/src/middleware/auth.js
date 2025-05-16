const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token de autenticação não fornecido' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Token inválido ou expirado' 
    });
  }
};

// Middleware para verificar funções específicas
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Não autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Acesso não autorizado para esta função'
      });
    }
    
    next();
  };
};

module.exports = {
  authMiddleware,
  checkRole
};