import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de } from 'date-fns/locale';

import { eventService, geoService } from '../../services';
import Loader from '../common/Loader';
import { useLocation } from '../../hooks/useLocation';

// Corrigir ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/map/marker-icon-2x.png',
  iconUrl: '/images/map/marker-icon.png',
  shadowUrl: '/images/map/marker-shadow.png'
});

// Ícone personalizado para eventos
const eventIcon = new L.Icon({
  iconUrl: '/images/map/event-marker.png',
  iconRetinaUrl: '/images/map/event-marker-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/map/marker-shadow.png',
  shadowSize: [41, 41]
});

// Ícone para eventos em destaque
const featuredEventIcon = new L.Icon({
  iconUrl: '/images/map/featured-event-marker.png',
  iconRetinaUrl: '/images/map/featured-event-marker-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/map/marker-shadow.png',
  shadowSize: [41, 41]
});

// Ícone para localização do usuário
const userLocationIcon = new L.Icon({
  iconUrl: '/images/map/user-location.png',
  iconRetinaUrl: '/images/map/user-location-2x.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const EventsMap = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const { userLocation, locationError } = useLocation();
  
  // Center do mapa (default: Belém do Pará - local da COP30)
  const [mapCenter, setMapCenter] = useState({
    lat: -1.4557,
    lng: -48.4902, 
    zoom: 12
  });
  
  // Mapeamento de locales para date-fns
  const locales = {
    'pt-BR': ptBR,
    'en-US': enUS,
    'es-ES': es,
    'fr-FR': fr,
    'de-DE': de
  };
  
  // Obter o locale atual
  const currentLocale = locales[i18n.language] || enUS;
  
  // Carregar eventos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        
        let eventsData;
        
        // Se temos a localização do usuário, carregar eventos próximos
        if (userLocation) {
          const { latitude, longitude } = userLocation;
          
          // Atualizar center do mapa para a localização do usuário
          setMapCenter({
            lat: latitude,
            lng: longitude,
            zoom: 13
          });
          
          // Carregar eventos próximos
          const response = await eventService.getNearbyEvents(
            latitude,
            longitude,
            5 // raio de 5km
          );
          
          eventsData = response.events || [];
        } else {
          // Carregar todos os eventos
          const response = await eventService.getEvents({ limit: 100 });
          eventsData = response.events || [];
        }
        
        setEvents(eventsData);
        setError(null);
      } catch (err) {
        setError(err.message || t('events.mapLoadError'));
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, [userLocation, t]);
  
  // Formatação de data e hora
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEE, d MMM', { locale: currentLocale });
  };
  
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Verificar se o evento está acontecendo agora
  const isHappeningNow = (event) => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    return now >= startTime && now <= endTime;
  };
  
  // Obter ícone apropriado para o evento
  const getEventIcon = (event) => {
    return event.is_featured ? featuredEventIcon : eventIcon;
  };
  
  if (loading) {
    return (
      <div className="events-map-container loading">
        <Loader />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="events-map-container error">
        <p className="error-message">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="events-map-container">
      <h2 className="map-title">{t('events.map')}</h2>
      
      <div className="map-wrapper">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={mapCenter.zoom}
          style={{ height: '500px', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Marcador para localização do usuário */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
            >
              <Popup>
                <div className="user-location-popup">
                  {t('map.yourLocation')}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Marcadores para eventos */}
          {events.map(event => (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
              icon={getEventIcon(event)}
            >
              <Popup>
                <div className="event-popup">
                  <h3 className="event-title">{event.name}</h3>
                  
                  {isHappeningNow(event) && (
                    <div className="happening-now-badge small">
                      {t('events.happeningNow')}
                    </div>
                  )}
                  
                  <div className="event-info">
                    <p className="event-date-time">
                      {formatEventDate(event.start_time)} | {formatEventTime(event.start_time)}
                    </p>
                    <p className="event-location">{event.location}</p>
                  </div>
                  
                  <div className="event-amacoins">
                    <img src="/images/amacoin-small.svg" alt="AmaCoins" />
                    <span>{event.amacoins_value}</span>
                  </div>
                  
                  <Link to={`/events/${event.id}`} className="btn btn-sm btn-primary">
                    {t('events.viewDetails')}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <img src="/images/map/event-marker.png" alt="Event" width="20" />
          <span>{t('events.regularEvent')}</span>
        </div>
        
        <div className="legend-item">
          <img src="/images/map/featured-event-marker.png" alt="Featured Event" width="20" />
          <span>{t('events.featuredEvent')}</span>
        </div>
        
        {userLocation && (
          <div className="legend-item">
            <img src="/images/map/user-location.png" alt="Your Location" width="15" />
            <span>{t('map.yourLocation')}</span>
          </div>
        )}
      </div>
      
      {locationError && (
        <div className="location-error">
          <p>{t('errors.locationAccess')}</p>
        </div>
      )}
    </div>
  );
};

export default EventsMap;