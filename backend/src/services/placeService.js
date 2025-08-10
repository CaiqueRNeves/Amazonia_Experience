import Place from '../models/Place.js';
import Visit from '../models/Visit.js';
import { NotFoundError, ValidationError } from '../middleware/error.js';

class PlaceService {
  async getPlaces(page = 1, limit = 10, filters = {}) {
    return Place.findAll(page, limit, filters);
  }

  async getPlace(id) {
    const place = await Place.findById(id);
    if (!place) {
      throw new NotFoundError('Local não encontrado');
    }
    return place;
  }

  async checkIn(userId, placeId) {
    const place = await Place.findById(placeId);
    if (!place) {
      throw new NotFoundError('Local não encontrado');
    }

    const visits = await Visit.getByPlaceId(placeId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyVisited = visits.some(v => {
      const visited = new Date(v.visited_at);
      visited.setHours(0, 0, 0, 0);
      return v.user_id === userId && visited.getTime() === today.getTime();
    });

    if (alreadyVisited) {
      throw new ValidationError('Você já realizou check-in neste local hoje');
    }

    return Visit.create({
      user_id: userId,
      place_id: placeId,
      amacoins_earned: place.amacoins_value
    });
  }
}

export default new PlaceService();
