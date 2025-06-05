import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { 
  validateCreatePlace, 
  validateUpdatePlace,
  validateCreatePartner,
  validateUpdateRole,
  validateCreateQuiz,
  validateUpdateQuiz,
  validateAddEmergencyService,
  validateUpdateConnectivitySpot
} from '../validators/adminValidator.js';

const router = express.Router();

// Todas as rotas requerem autenticação e função de administrador
router.use(authMiddleware);
router.use(checkRole(['admin']));

// Gerenciamento de locais
router.post('/places', validateCreatePlace, adminController.createPlace);
router.put('/places/:id', validateUpdatePlace, adminController.updatePlace);

// Gerenciamento de parceiros
router.post('/partners', validateCreatePartner, adminController.createPartner);

// Gerenciamento de usuários
router.put('/users/:id/role', validateUpdateRole, adminController.updateUserRole);

// Gerenciamento de quizzes
router.post('/quizzes', validateCreateQuiz, adminController.createQuiz);
router.put('/quizzes/:id', validateUpdateQuiz, adminController.updateQuiz);

// Gerenciamento de emergência
router.post('/emergency/services', validateAddEmergencyService, adminController.addEmergencyService);

// Gerenciamento de conectividade
router.put('/connectivity/spots', validateUpdateConnectivitySpot, adminController.updateConnectivitySpot);

export default router;
