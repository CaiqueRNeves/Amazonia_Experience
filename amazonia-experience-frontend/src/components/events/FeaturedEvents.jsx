import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useSwipeable } from 'react-swipeable';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de } from 'date-fns/locale';

import { eventService } from '../../services';
import Loader from '../common/Loader';

const FeaturedEvents = () => {
  const { t, i18n } = useTranslation();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
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
    const loadFeaturedEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getFeaturedEvents({ limit: 5 });
        setFeaturedEvents(data.events || []);
        setError(null);
      } catch (err) {
        setError(err.message || t('events.featuredLoadError'));
      } finally {
        setLoading(false);
      }
    };
    
    loadFeaturedEvents();
  }, [t]);
  
  // Navegação do carrossel
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === featuredEvents.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? featuredEvents.length - 1 : prevIndex - 1
    );
  };
  
  // Configuração do swipe para dispositivos móveis
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrev,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  
  // Formatação de data e hora
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEE, d MMM', { locale: currentLocale });
  };
  
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Verificar se há algum evento em destaque para mostrar
  if (!loading && featuredEvents.length === 0) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="featured-events-container loading">
        <Loader />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="featured-events-container error">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="featured-events-container" {...swipeHandlers}>
      <h2 className="featured-events-title">
        {t('events.featuredEvents')}
      </h2>
      
      <div className="featured-events-carousel">
        <button 
          onClick={goToPrev}
          className="carousel-nav prev"
          aria-label={t('common.previous')}
        >
          <ChevronLeftIcon className="icon" />
        </button>
        
        <div className="carousel-content">
          {featuredEvents.map((event, index) => (
            <div 
              key={event.id}
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`
              }}
            >
              <div className="event-image">
                <img 
                  src={event.image_url || '/images/event-placeholder.jpg'} 
                  alt={event.name} 
                />
              </div>
              
              <div className="event-info">
                <div className="event-date-time">
                  <span className="event-date">
                    {formatEventDate(event.start_time)}
                  </span>
                  <span className="event-time">
                    {formatEventTime(event.start_time)}
                  </span>
                </div>
                
                <h3 className="event-title">{event.name}</h3>
                
                <p className="event-location">{event.location}</p>
                
                <div className="event-actions">
                  <div className="amacoins-value">
                    <img src="/images/amacoin.svg" alt="AmaCoins" />
                    <span>{event.amacoins_value}</span>
                  </div>
                  
                  <Link to={`/events/${event.id}`} className="btn btn-primary">
                    {t('events.viewDetails')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={goToNext}
          className="carousel-nav next"
          aria-label={t('common.next')}
        >
          <ChevronRightIcon className="icon" />
        </button>
      </div>
      
      <div className="carousel-indicators">
        {featuredEvents.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={t('events.goToSlide', { number: index + 1 })}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedEvents;