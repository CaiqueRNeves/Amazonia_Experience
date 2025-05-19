import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { ptBR, enUS, es, fr, de } from 'date-fns/locale';

import { eventService } from '../../services';
import Loader from '../common/Loader';

const EventWeeklySchedule = () => {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekEvents, setWeekEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  
  // Calcular o início e fim da semana
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Semana começa na segunda
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Gerar array com todos os dias da semana
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Carregar eventos da semana
  useEffect(() => {
    const fetchWeekEvents = async () => {
      try {
        setLoading(true);
        
        const response = await eventService.getEventsByDate(
          weekStart,
          weekEnd,
          { limit: 100 } // Carregar mais eventos para cobrir a semana inteira
        );
        
        // Organizar eventos por dia
        const eventsByDay = {};
        
        weekDays.forEach(day => {
          eventsByDay[format(day, 'yyyy-MM-dd')] = [];
        });
        
        response.events.forEach(event => {
          const eventDate = format(new Date(event.start_time), 'yyyy-MM-dd');
          
          if (eventsByDay[eventDate]) {
            eventsByDay[eventDate].push(event);
          }
        });
        
        // Ordenar eventos de cada dia por horário
        Object.keys(eventsByDay).forEach(date => {
          eventsByDay[date].sort((a, b) => {
            return new Date(a.start_time) - new Date(b.start_time);
          });
        });
        
        setWeekEvents(eventsByDay);
        setError(null);
      } catch (err) {
        setError(err.message || t('events.weeklyLoadError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeekEvents();
  }, [weekStart, weekEnd, t]);
  
  // Navegar para a semana anterior
  const goToPreviousWeek = () => {
    setCurrentDate(addDays(weekStart, -7));
  };
  
  // Navegar para a próxima semana
  const goToNextWeek = () => {
    setCurrentDate(addDays(weekStart, 7));
  };
  
  // Formatar cabeçalho do dia da semana
  const formatDayHeader = (date) => {
    return format(date, 'EEE', { locale: currentLocale });
  };
  
  // Formatar número do dia
  const formatDayNumber = (date) => {
    return format(date, 'd');
  };
  
  // Formatar hora do evento
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Verificar se o dia tem eventos
  const hasEvents = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return weekEvents[dateKey] && weekEvents[dateKey].length > 0;
  };
  
  if (loading) {
    return (
      <div className="weekly-schedule-container loading">
        <Loader />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="weekly-schedule-container error">
        <p className="error-message">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="weekly-schedule-container">
      <div className="weekly-header">
        <h2 className="weekly-title">
          {t('events.weeklySchedule')}
        </h2>
        
        <div className="week-navigation">
          <button
            onClick={goToPreviousWeek}
            className="nav-button prev"
            aria-label={t('calendar.previousWeek')}
          >
            <ChevronLeftIcon className="icon" />
          </button>
          
          <span className="week-indicator">
            {format(weekStart, 'MMMM d', { locale: currentLocale })} - {format(weekEnd, 'MMMM d, yyyy', { locale: currentLocale })}
          </span>
          
          <button
            onClick={goToNextWeek}
            className="nav-button next"
            aria-label={t('calendar.nextWeek')}
          >
            <ChevronRightIcon className="icon" />
          </button>
        </div>
      </div>
      
      <div className="weekly-grid">
        {weekDays.map(day => (
          <div 
            key={day.toISOString()} 
            className={`day-column ${isToday(day) ? 'today' : ''}`}
          >
            <div className="day-header">
              <span className="day-name">{formatDayHeader(day)}</span>
              <span className="day-number">{formatDayNumber(day)}</span>
            </div>
            
            <div className="day-events">
              {hasEvents(day) ? (
                weekEvents[format(day, 'yyyy-MM-dd')].map(event => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className={`day-event ${event.is_featured ? 'featured' : ''}`}
                  >
                    <span className="event-time">
                      {formatEventTime(event.start_time)}
                    </span>
                    <span className="event-title">
                      {event.name}
                    </span>
                    <span className="event-location">
                      {event.location}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="no-events">
                  {t('events.noEventsForDay')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventWeeklySchedule;