import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  TagIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const EventCard = ({ event, formatDate }) => {
  const { t } = useTranslation();
  
  // Função para formatação relativa de data (hoje, amanhã, etc)
  const getRelativeDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return t('events.today');
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return t('events.tomorrow');
    }
    
    return formatDate(dateString);
  };
  
  // Formatar horário
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Verificar se o evento está acontecendo agora
  const isHappeningNow = () => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    return now >= startTime && now <= endTime;
  };
  
  // Traduzir tipo de evento
  const translateEventType = (type) => {
    return t(`events.types.${type}`);
  };
  
  // Calcular capacidade disponível
  const availableCapacity = event.max_capacity 
    ? Math.max(0, event.max_capacity - event.current_attendance)
    : null;
  
  // Verificar se o evento está cheio
  const isFull = event.max_capacity && event.current_attendance >= event.max_capacity;

  return (
    <div className={`event-card ${event.is_featured ? 'featured' : ''} ${isHappeningNow() ? 'happening-now' : ''}`}>
      {isHappeningNow() && (
        <div className="happening-now-badge">
          {t('events.happeningNow')}
        </div>
      )}
      
      {event.is_featured && (
        <div className="featured-badge">
          {t('events.featured')}
        </div>
      )}
      
      <div className="event-image">
        <img 
          src={event.image_url || '/images/event-placeholder.jpg'} 
          alt={event.name} 
        />
      </div>
      
      <div className="event-content">
        <h3 className="event-title">{event.name}</h3>
        
        <div className="event-info">
          <div className="event-info-item">
            <CalendarIcon className="icon" />
            <span>{getRelativeDate(event.start_time)}</span>
          </div>
          
          <div className="event-info-item">
            <ClockIcon className="icon" />
            <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
          </div>
          
          <div className="event-info-item">
            <MapPinIcon className="icon" />
            <span>{event.location}</span>
          </div>
          
          <div className="event-info-item">
            <TagIcon className="icon" />
            <span>{translateEventType(event.event_type)}</span>
          </div>
          
          {event.max_capacity && (
            <div className="event-info-item">
              <UserGroupIcon className="icon" />
              <span>
                {isFull 
                  ? t('events.capacityFull') 
                  : t('events.capacityAvailable', { available: availableCapacity, total: event.max_capacity })}
              </span>
            </div>
          )}
        </div>
        
        <div className="event-footer">
          <div className="amacoins-value">
            <img src="/images/amacoin.svg" alt="AmaCoins" />
            <span>{event.amacoins_value} {t('common.amacoins')}</span>
          </div>
          
          <Link to={`/events/${event.id}`} className="btn btn-primary">
            {t('events.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;