import placeService from '../../src/services/placeService.js';
import Place from '../../src/models/Place.js';
import Visit from '../../src/models/Visit.js';

// Mock dos modelos
jest.mock('../../src/models/Place.js');
jest.mock('../../src/models/Visit.js');

describe('PlaceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlaces', () => {
    it('deve retornar locais com paginação', async () => {
      const mockPlaces = [
        { 
          id: 1, 
          name: 'Mercado Ver-o-Peso',
          type: 'tourist_spot'
        },
        { 
          id: 2, 
          name: 'Estação das Docas',
          type: 'cultural_venue'
        }
      ];

      // Mock da função findAll
      Place.findAll.mockResolvedValue(mockPlaces);

      // Executar o método
      const result = await placeService.getPlaces(1, 10, {});

      // Verificações
      expect(Place.findAll).toHaveBeenCalledWith(1, 10, {});
      expect(result).toEqual(mockPlaces);
    });

    it('deve aplicar filtros corretamente', async () => {
      const mockPlaces = [{ 
        id: 1, 
        name: 'Mercado Ver-o-Peso',
        type: 'tourist_spot'
      }];
      
      const filters = { 
        type: 'tourist_spot'
      };

      // Mock da função findAll
      Place.findAll.mockResolvedValue(mockPlaces);

      // Executar o método
      const result = await placeService.getPlaces(1, 10, filters);

      // Verificações
      expect(Place.findAll).toHaveBeenCalledWith(1, 10, filters);
      expect(result).toEqual(mockPlaces);
    });
  });

  describe('getPlace', () => {
    it('deve retornar um local específico pelo ID', async () => {
      const placeId = 1;
      const mockPlace = { 
        id: placeId, 
        name: 'Mercado Ver-o-Peso',
        type: 'tourist_spot',
        description: 'Maior feira livre da América Latina',
        amacoins_value: 20
      };

      // Mock da função findById
      Place.findById.mockResolvedValue(mockPlace);

      // Executar o método
      const result = await placeService.getPlace(placeId);

      // Verificações
      expect(Place.findById).toHaveBeenCalledWith(placeId);
      expect(result).toEqual(mockPlace);
    });

    it('deve lançar erro se o local não for encontrado', async () => {
      const placeId = 999;

      // Mock da função findById retornando null (não encontrado)
      Place.findById.mockResolvedValue(null);

      // Executar o método e verificar se o erro é lançado
      await expect(placeService.getPlace(placeId))
        .rejects.toThrow('Local não encontrado');
      
      expect(Place.findById).toHaveBeenCalledWith(placeId);
    });
  });

  describe('checkIn', () => {
    it('deve realizar check-in em um local com sucesso', async () => {
      const userId = 1;
      const placeId = 2;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Mock dos dados
      const mockPlace = {
        id: placeId,
        name: 'Mercado Ver-o-Peso',
        amacoins_value: 20
      };

      const mockVisit = {
        id: 1,
        user_id: userId,
        place_id: placeId,
        amacoins_earned: 20,
        status: 'pending'
      };

      // Mock das funções
      Place.findById.mockResolvedValue(mockPlace);
      Visit.getByPlaceId.mockResolvedValue([]);  // Nenhuma visita existente hoje
      Visit.create.mockResolvedValue(mockVisit);

      // Executar o método
      const result = await placeService.checkIn(userId, placeId);

      // Verificações
      expect(Place.findById).toHaveBeenCalledWith(placeId);
      expect(Visit.getByPlaceId).toHaveBeenCalledWith(placeId);
      expect(Visit.create).toHaveBeenCalled();
      expect(result).toEqual(mockVisit);
    });

    it('deve lançar erro se o usuário já fez check-in neste local hoje', async () => {
      const userId = 1;
      const placeId = 2;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Mock dos dados
      const mockPlace = {
        id: placeId,
        name: 'Mercado Ver-o-Peso',
        amacoins_value: 20
      };

      // Simular uma visita existente feita hoje
      const existingVisits = [
        {
          id: 1,
          user_id: userId,
          place_id: placeId,
          status: 'verified',
          visited_at: today  // Hoje
        }
      ];

      // Mock das funções
      Place.findById.mockResolvedValue(mockPlace);
      Visit.getByPlaceId.mockResolvedValue(existingVisits);

      // Monkeypatch para Date
      const originalDate = Date;
      global.Date = class extends Date {
        constructor() {
          super();
          return today;
        }
        static now() {
          return today.getTime();
        }
      };

      // Executar o método e verificar se o erro é lançado
      await expect(placeService.checkIn(userId, placeId))
        .rejects.toThrow('Você já realizou check-in neste local hoje');
      
      // Restaurar Date original
      global.Date = originalDate;
      
      expect(Place.findById).toHaveBeenCalledWith(placeId);
      expect(Visit.getByPlaceId).toHaveBeenCalledWith(placeId);
      expect(Visit.create).not.toHaveBeenCalled();
    });
  });
});
