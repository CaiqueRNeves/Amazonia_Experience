const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');
const { validateEventCheckin } = require('../validators/eventValidator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do evento
 *         name:
 *           type: string
 *           description: Nome do evento
 *         description:
 *           type: string
 *           description: Descrição detalhada do evento
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Data e hora de início do evento
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Data e hora de término do evento
 *         location:
 *           type: string
 *           description: Nome do local do evento
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitude do local do evento
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitude do local do evento
 *         event_type:
 *           type: string
 *           enum: [conference, panel, workshop, exhibition, cultural, social]
 *           description: Tipo do evento
 *         amacoins_value:
 *           type: integer
 *           description: Quantidade de AmaCoins ganha ao participar do evento
 *         max_capacity:
 *           type: integer
 *           description: Capacidade máxima do evento (null para sem limite)
 *         current_attendance:
 *           type: integer
 *           description: Número atual de participantes
 *         is_featured:
 *           type: boolean
 *           description: Indica se o evento é destaque
 *         image_url:
 *           type: string
 *           description: URL da imagem do evento
 *         registration_link:
 *           type: string
 *           description: Link para inscrição no evento (opcional)
 *     Visit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da visita
 *         user_id:
 *           type: integer
 *           description: ID do usuário que fez a visita
 *         event_id:
 *           type: integer
 *           description: ID do evento visitado (opcional)
 *         place_id:
 *           type: integer
 *           description: ID do local visitado (opcional)
 *         amacoins_earned:
 *           type: integer
 *           description: Quantidade de AmaCoins ganha com a visita
 *         status:
 *           type: string
 *           enum: [pending, verified, rejected]
 *           description: Status da visita
 *         verification_code:
 *           type: string
 *           description: Código de verificação para a visita
 *         visited_at:
 *           type: string
 *           format: date-time
 *           description: Data e hora da visita
 */

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Gerenciamento de eventos e visitas
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Lista eventos
 *     description: Retorna lista paginada de eventos com filtros opcionais
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página a ser retornada
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de eventos por página
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *           enum: [conference, panel, workshop, exhibition, cultural, social]
 *         description: Filtrar por tipo de evento
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filtrar apenas eventos em destaque
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar eventos a partir desta data
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar eventos até esta data
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar eventos por texto no título ou descrição
 *     responses:
 *       200:
 *         description: Lista de eventos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 */
router.get('/', eventController.getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Detalhes de um evento
 *     description: Retorna os detalhes de um evento específico
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do evento
 *     responses:
 *       200:
 *         description: Evento encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento não encontrado
 */
router.get('/:id', eventController.getEvent);

/**
 * @swagger
 * /events/nearby:
 *   get:
 *     summary: Eventos próximos
 *     description: Retorna eventos próximos à localização especificada
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude da localização
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude da localização
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: float
 *           default: 5
 *         description: Raio de busca em km
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página a ser retornada
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de eventos por página
 *     responses:
 *       200:
 *         description: Lista de eventos próximos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: Parâmetros de localização inválidos
 */
router.get('/nearby', eventController.getNearbyEvents);

/**
 * @swagger
 * /events/checkin:
 *   post:
 *     summary: Realizar check-in em um evento
 *     description: Permite que o usuário faça check-in em um evento e ganhe AmaCoins
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *             properties:
 *               event_id:
 *                 type: integer
 *                 description: ID do evento para check-in
 *     responses:
 *       201:
 *         description: Check-in realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     visit:
 *                       $ref: '#/components/schemas/Visit'
 *                     verification_code:
 *                       type: string
 *                       example: ABC12345
 *       400:
 *         description: Erro na validação ou evento com capacidade máxima atingida
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Evento não encontrado
 */
router.post('/checkin', authMiddleware, validateEventCheckin, eventController.checkIn);

module.exports = router;