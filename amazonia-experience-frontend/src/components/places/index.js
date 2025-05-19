// Exportar componentes individuais
export { default as PlaceCard } from './PlaceCard';
export { default as PlaceDetail } from './PlaceDetail';
export { default as PlaceList } from './PlaceList';
export { default as PlaceMap } from './PlaceMap';
export { default as PlaceFilter } from './PlaceFilter';
export { default as PlaceCheckIn } from './PlaceCheckIn';
export { default as NearbyPlaces } from './NearbyPlaces';

// Exportar todos os componentes como objeto padrão
import PlaceCard from './PlaceCard';
import PlaceDetail from './PlaceDetail';
import PlaceList from './PlaceList';
import PlaceMap from './PlaceMap';
import PlaceFilter from './PlaceFilter';
import PlaceCheckIn from './PlaceCheckIn';
import NearbyPlaces from './NearbyPlaces';

export default {
  PlaceCard,
  PlaceDetail,
  PlaceList,
  PlaceMap,
  PlaceFilter,
  PlaceCheckIn,
  NearbyPlaces
};