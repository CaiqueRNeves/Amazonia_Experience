import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  CircleMarker,
  useMap,
  ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  WifiIcon, 
  CheckBadgeIcon, 
  XMarkIcon, 
  ArrowsPointingOutIcon,
  LocationMarkerIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import { useLocation } from '../../hooks/useLocation';
import LoadingIndicator from '../common/LoadingIndicator';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ConnectivitySpotPopup from './ConnectivitySpotPopup';

// Corrige o problema com os ícones do Leaflet
// Este trecho é necessário para carregar os ícones corretamente
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Corrigir ícones padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Componente para recentralizar o mapa
const RecenterMap = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
};

RecenterMap.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number)
};

// Componente principal do mapa
const ConnectivityMap = ({ spots = [], userLocation, loading = false, onSpotClick }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const { userLocation: locationHook, isLocating } = useLocation();
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(13);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Inicializar o centro do mapa
  useEffect(() => {
    // Se tivermos a localização do usuário, usá-la
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    } 
    // Se houver spots, centralizar no primeiro
    else if (spots.length > 0) {
      setMapCenter([spots[0].latitude, spots[0].longitude]);
    }
    // Ou usar localização do hook, se disponível
    else if (locationHook) {
      setMapCenter([locationHook.latitude, locationHook.longitude]);
    }
    // Centro padrão (Belém, Brasil - local da COP30)
    else {
      setMapCenter([-1.4558, -48.5039]);
      setMapZoom(12);
    }
  }, [userLocation, spots, locationHook]);
  
  // Alternar entre visualização normal e tela cheia
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  // Cor baseada na velocidade do Wi-Fi
  const getSpeedColor = (speed) => {
    switch (speed) {
      case 'fast':
        return '#22c55e'; // Verde
      case 'medium':
        return '#f59e0b'; // Amarelo
      case 'slow':
        return '#ef4444'; // Vermelho
      default:
        return '#64748b'; // Cinza
    }
  };
  
  // Cor baseada na intensidade do sinal
  const getSignalColor = (strength) => {
    if (!strength && strength !== 0) return '#64748b'; // Cinza para desconhecido
    
    if (strength >= 8) return '#22c55e'; // Verde para sinal forte
    if (strength >= 5) return '#f59e0b'; // Amarelo para sinal médio
    return '#ef4444'; // Vermelho para sinal fraco
  };
  
  // Se estiver carregando e não houver spots, mostrar indicador
  if (loading && spots.length === 0) {
    return <LoadingIndicator message={t('connectivity.loadingMap')} />;
  }

  return (
    <div className={`connectivity-map-container ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="map-controls">
        <IconButton
          icon={<ArrowsPointingOutIcon className="icon" />}
          onClick={toggleFullscreen}
          label={t(fullscreen ? 'common.exitFullscreen' : 'common.fullscreen')}
        />
        <IconButton
          icon={showHeatmap ? <WifiIcon className="icon" /> : <LocationMarkerIcon className="icon" />}
          onClick={() => setShowHeatmap(!showHeatmap)}
          label={t(showHeatmap ? 'connectivity.showMarkers' : 'connectivity.showHeatmap')}
        />
      </div>
      
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: '100%', height: fullscreen ? '100vh' : '500px' }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ZoomControl position="bottomright" />
        
        {/* Recentralizar o mapa quando o centro mudar */}
        <RecenterMap position={mapCenter} />
        
        {/* Marcador da localização do usuário */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={8}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.5 }}
          >
            <Popup>
              <div className="user-location-popup">
                <h3>{t('connectivity.yourLocation')}</h3>
                <p>{t('connectivity.coordinates')}: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </CircleMarker>
        )}
        
        {/* Mostrar pontos de conectividade */}
        {!showHeatmap && spots.map(spot => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            title={spot.name}
            eventHandlers={{
              click: () => {
                if (onSpotClick) {
                  onSpotClick(spot);
                }
              }
            }}
          >
            <Popup>
              <ConnectivitySpotPopup spot={spot} />
            </Popup>
          </Marker>
        ))}
        
        {/* Mapa de calor (representação simples) */}
        {showHeatmap && spots.map(spot => (
          <CircleMarker
            key={spot.id}
            center={[spot.latitude, spot.longitude]}
            radius={spot.avg_signal_strength ? spot.avg_signal_strength * 2 : 10}
            pathOptions={{
              color: getSignalColor(spot.avg_signal_strength),
              fillColor: getSignalColor(spot.avg_signal_strength),
              fillOpacity: 0.6
            }}
            eventHandlers={{
              click: () => {
                if (onSpotClick) {
                  onSpotClick(spot);
                }
              }
            }}
          >
            <Popup>
              <ConnectivitySpotPopup spot={spot} />
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="map-legend">
        <h4>{t('connectivity.mapLegend')}</h4>
        <div className="legend-item">
          <div className="color-box fast"></div>
          <span>{t('connectivity.speeds.fast')}</span>
        </div>
        <div className="legend-item">
          <div className="color-box medium"></div>
          <span>{t('connectivity.speeds.medium')}</span>
        </div>
        <div className="legend-item">
          <div className="color-box slow"></div>
          <span>{t('connectivity.speeds.slow')}</span>
        </div>
        <div className="legend-item">
          <div className="color-box unknown"></div>
          <span>{t('connectivity.speeds.unknown')}</span>
        </div>
      </div>
    </div>
  );
};

ConnectivityMap.propTypes = {
  spots: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    wifi_speed: PropTypes.string,
    is_free: PropTypes.bool,
    is_verified: PropTypes.bool,
    avg_signal_strength: PropTypes.number
  })),
  userLocation: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  }),
  loading: PropTypes.bool,
  onSpotClick: PropTypes.func
};

export default ConnectivityMap;