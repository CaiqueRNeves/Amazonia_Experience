import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de } from 'date-fns/locale';

import { fetchEvents, setEventFilters } from '../../redux/slices/eventSlice';
import EventCard from './EventCard';
import EventFilter from './EventFilter';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import { useLocation } from '../../hooks/useLocation';
import { eventService } from '../../services';

const EventList = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { events, loading, error, filters, pagination } = useSelector((state) => state.events);
  const [showNearby, setShowNearby] = useState(false);
  const { userLocation, locationError, isLocating } = useLocation();

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

  useEffect(() => {
    // Carregar eventos ao montar o componente
    dispatch(fetchEvents(filters));
  }, [dispatch, filters]);

  // Carregar eventos próximos quando a localização do usuário estiver disponível
  useEffect(() => {
    if (showNearby && userLocation) {
      const { latitude, longitude } = userLocation;
      loadNearbyEvents(latitude, longitude);
    }
  }, [showNearby, userLocation]);

  const loadNearbyEvents = async (latitude, longitude) => {
    try {
      const response = await eventService.getNearbyEvents(latitude, longitude);
      // Atualizar o Redux com os eventos próximos
      // Aqui podemos despachar uma ação específica para eventos próximos
      // ou usar a mesma ação de eventos mas com uma flag
    } catch (error) {
      console.error('Erro ao carregar eventos próximos:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setEventFilters(newFilters));
  };

  const handlePageChange = (newPage) => {
    dispatch(setEventFilters({ ...filters, page: newPage }));
  };

  const toggleNearbyEvents = () => {
    setShowNearby(!showNearby);
  };

  // Formatar data e hora do evento
  const formatEventDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: currentLocale });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>{t('events.loadError')}</h3>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchEvents(filters))}>
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>{t('events.title')}</h1>
        <p>{t('events.subtitle')}</p>
      </div>

      <EventFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <div className="nearby-events-toggle">
        <button 
          className={`btn ${showNearby ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={toggleNearbyEvents}
          disabled={isLocating}
        >
          {isLocating ? t('common.locating') : t('events.showNearby')}
        </button>
        
        {locationError && (
          <p className="text-danger">{t('errors.location')}</p>
        )}
      </div>

      {events.length > 0 ? (
        <div className="events-grid">
          {events.map(event => (
            <EventCard 
              key={event.id}
              event={event}
              formatDate={formatEventDateTime}
            />
          ))}
        </div>
      ) : (
        <EmptyState 
          message={t('events.noEvents')}
          icon="calendar"
        />
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default EventList;