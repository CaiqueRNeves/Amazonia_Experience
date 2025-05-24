import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../ui';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Corrige o problema dos ícones de marcador do Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Componente interno para recentralizar o mapa quando as coordenadas mudam
const MapCentering = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

/**
 * Componente de mapa para exibir locais
 */
const PlaceMap = ({ 
  places, 
  place,
  center, 
  zoom = 13, 
  interactive = true,
  onMarkerClick,
  className = '',
  height = "500px"
}) => {
  const { t } = useTranslation();
  const [mapInstance, setMapInstance] = useState(null);
  
  const defaultIcon = useMemo(() => {
    return L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);
  
  // Determinar o centro do mapa
  const mapCenter = useMemo(() => {
    if (center) {
      return [center.lat, center.lng];
    } else if (place) {
      return [place.latitude, place.longitude];
    } else if (places && places.length > 0) {
      // Usar o primeiro local como centro
      return [places[0].latitude, places[0].longitude];
    }
    // Coordenadas padrão (Belém do Pará)
    return [-1.455833, -48.503889];
  }, [center, place, places]);
  
  useEffect(() => {
    if (mapInstance && places && places.length > 1) {
      // Ajustar a visualização para ver todos os marcadores
      const bounds = L.latLngBounds(places.map(p => [p.latitude, p.longitude]));
      mapInstance.fitBounds(bounds);
    }
  }, [mapInstance, places]);

  const handleMapReady = (map) => {
    setMapInstance(map);
  };
  
  return (
    <div className={`place-map ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={handleMapReady}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        dragging={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCentering center={mapCenter} zoom={zoom} />
        
        {/* Exibir marcador único se place for fornecido */}
        {place && (
          <Marker 
            position={[place.latitude, place.longitude]} 
            icon={defaultIcon}
          >
            <Popup>
              <div className="place-map__popup">
                <h4>{place.name}</h4>
                <p>{place.address}</p>
                <Link to={`/places/${place.id}`}>
                  <Button size="sm">{t('places.viewDetails')}</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Exibir múltiplos marcadores se places for fornecido */}
        {places && places.map(place => (
          <Marker 
            key={place.id} 
            position={[place.latitude, place.longitude]} 
            icon={defaultIcon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(place)
            }}
          >
            <Popup>
              <div className="place-map__popup">
                <h4>{place.name}</h4>
                <p>{place.address}</p>
                {place.distance && (
                  <p className="place-map__distance">
                    {place.distance < 1
                      ? `${Math.round(place.distance * 1000)}m`
                      : `${place.distance.toFixed(1)}km`} {t('places.away')}
                  </p>
                )}
                <Link to={`/places/${place.id}`}>
                  <Button size="sm">{t('places.viewDetails')}</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

PlaceMap.propTypes = {
  places: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
      address: PropTypes.string,
      distance: PropTypes.number
    })
  ),
  place: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    address: PropTypes.string
  }),
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  zoom: PropTypes.number,
  interactive: PropTypes.bool,
  onMarkerClick: PropTypes.func,
  className: PropTypes.string,
  height: PropTypes.string
};

export default PlaceMap;