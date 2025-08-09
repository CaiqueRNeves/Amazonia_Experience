import eventService from '../../src/services/eventService.js';
import Event from '../../src/models/Event.js';
import Visit from '../../src/models/Visit.js';

// Mock dos modelos
jest.mock('../../src/models/Event.js');
jest.mock('../../src/models/Visit.js');

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('deve retornar eventos com paginação', async () => {
      const mockEvents = [
        { 
          id: 1, 
          name: 'Cerimônia de Abertura',
          event_type: 'conference',
          start_time: new Date('2025-11-10T09:00:00.000Z')
        },
        { 
          id: 2, 
          name: 'Painel Biodiversidade',
          event_type: 'panel',
          start_time: new Date('2025-11-11T10:00:00.000Z')
        }
      ];

      // Mock da função findAll
      Event.findAll.mockResolvedValue(mockEvents);

      // Executar o método
      const result = await eventService.getEvents(1, 10, {});

      // Verificações
      expect(Event.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(result).toEqual(mockEvents);
    });

    it('deve aplicar filtros corretamente', async () => {
      const mockEvents = [{ 
        id: 1, 
        name: 'Cerimônia de Abertura',
        event_type: 'conference',
        is_featured: true
      }];
      
      const filters = { 
        eventType: 'conference', 
        isFeatured: true
      };

      // Mock da função findAll
      Event.findAll.mockResolvedValue(mockEvents);

      // Executar o método
      const result = await eventService.getEvents(1, 10, filters);

      // Verificações
      expect(Event.findAll).toHaveBeenCalledWith(1, 10, filters);
      expect(result).toEqual(mockEvents);
    });
  });

  describe('checkIn', () => {
    it('deve realizar check-in em um evento com sucesso', async () => {
      const userId = 1;
      const eventId = 2;

      // Mock dos dados
      const mockEvent = {
        id: eventId,
        name: 'Cerimônia de Abertura',
        amacoins_value: 50,
        max_capacity: 100,
        current_attendance: 50
      };

      const mockVisit = {
        id: 1,
        user_id: userId,
        event_id: eventId,
        amacoins_earned: 50,
        status: 'pending'
      };

      // Mock das funções
      Event.findById.mockResolvedValue(mockEvent);
      Visit.getByEventId.mockResolvedValue([]);  // Nenhuma visita existente
      Visit.create.mockResolvedValue(mockVisit);

      // Executar o método
      const result = await eventService.checkIn(userId, eventId);

      // Verificações
      expect(Event.findById).toHaveBeenCalledWith(eventId);
      expect(Visit.getByEventId).toHaveBeenCalledWith(eventId);
      expect(Visit.create).toHaveBeenCalled();
      expect(Event.incrementAttendance).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(mockVisit);
    });

    it('deve lançar erro se o evento já atingiu capacidade máxima', async () => {
      const userId = 1;
      const eventId = 2;

      // Mock dos dados
      const mockEvent = {
        id: eventId,
        name: 'Cerimônia de Abertura',
        amacoins_value: 50,
        max_capacity: 100,
        current_attendance: 100  // Capacidade máxima atingida
      };

      // Mock das funções
      Event.findById.mockResolvedValue(mockEvent);

      // Executar o método e verificar se o erro é lançado
      await expect(eventService.checkIn(userId, eventId))
        .rejects.toThrow('Evento já atingiu capacidade máxima');
      
      expect(Event.findById).toHaveBeenCalledWith(eventId);
      expect(Visit.create).not.toHaveBeenCalled();
      expect(Event.incrementAttendance).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o usuário já fez check-in neste evento', async () => {
      const userId = 1;
      const eventId = 2;

      // Mock dos dados
      const mockEvent = {
        id: eventId,
        name: 'Cerimônia de Abertura',
        amacoins_value: 50,
        max_capacity: 100,
        current_attendance: 50
      };

      const existingVisits = [
        {
          id: 1,
          user_id: userId,  // Mesmo usuário
          event_id: eventId,
          status: 'pending'
        }
      ];

      // Mock das funções
      Event.findById.mockResolvedValue(mockEvent);
      Visit.getByEventId.mockResolvedValue(existingVisits);

      // Executar o método e verificar se o erro é lançado
      await expect(eventService.checkIn(userId, eventId))
        .rejects.toThrow('Você já realizou check-in neste evento');
      
      expect(Event.findById).toHaveBeenCalledWith(eventId);
      expect(Visit.getByEventId).toHaveBeenCalledWith(eventId);
      expect(Visit.create).not.toHaveBeenCalled();
      expect(Event.incrementAttendance).not.toHaveBeenCalled();
    });
  });

  describe('getNearbyEvents', () => {
    it('deve retornar eventos próximos', async () => {
      const latitude = -1.4500;
      const longitude = -48.4800;
      const radius = 5;

      const mockEvents = [
        {
          id: 1,
          name: 'Evento Próximo',
          distance: 2.5  // Em Km
        }
      ];

      // Mock da função findNearby
      Event.findNearby.mockResolvedValue(mockEvents);

      // Executar o método
      const result = await eventService.getNearbyEvents(latitude, longitude, radius);

      // Verificações
      expect(Event.findNearby).toHaveBeenCalledWith(
        latitude,
        longitude,
        radius,
        1,  // página padrão
        10  // limite padrão
      );
      expect(result).toEqual(mockEvents);
    });

    it('deve lançar erro para coordenadas inválidas', async () => {
      // Executar o método sem fornecer latitude ou longitude
      await expect(eventService.getNearbyEvents(null, -48.4800))
        .rejects.toThrow('Latitude e longitude são obrigatórios');
      
      expect(Event.findNearby).not.toHaveBeenCalled();
    });
  });
});
