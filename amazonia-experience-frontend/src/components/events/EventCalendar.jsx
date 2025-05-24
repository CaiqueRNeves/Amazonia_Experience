import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de } from 'date-fns/locale';

import { eventService } from '../../services';
import Loader from '../common/Loader';

const EventCalendar = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventDates, setEventDates] = useState({});
  
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
  
  // Carregar todos os eventos do mês atual
  useEffect(() => {
    const fetchMonthEvents = async () => {
      try {
        setLoading(true);
        
        // Calcular o primeiro e último dia do mês
        const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const response = await eventService.getEventsByDate(
          firstDayOfMonth,
          lastDayOfMonth,
          { limit: 100 } // Carregar mais eventos para ter uma boa cobertura do calendário
        );
        
        // Mapear eventos por data
        const dateMap = {};
        response.events.forEach(event => {
          const eventDate = new Date(event.start_time).toDateString();
          if (!dateMap[eventDate]) {
            dateMap[eventDate] = [];
          }
          dateMap[eventDate].push(event);
        });
        
        setEventDates(dateMap);
        
        // Filtrar eventos para a data selecionada
        filterEventsForSelectedDate(selectedDate, dateMap);
        
        setError(null);
      } catch (err) {
        setError(err.message || t('events.calendarLoadError'));
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonthEvents();
  }, [selectedDate.getMonth(), selectedDate.getFullYear(), t]);
  
  // Filtrar eventos para a data selecionada
  const filterEventsForSelectedDate = (date, dateMap = eventDates) => {
    const dateString = date.toDateString();
    setEvents(dateMap[dateString] || []);
  };
  
  // Manipular mudança de data
  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterEventsForSelectedDate(date);
  };
  
  // Personalizar conteúdo da célula do calendário
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateString = date.toDateString();
    const hasEvents = eventDates[dateString] && eventDates[dateString].length > 0;
    
    return hasEvents ? (
      <div className="calendar-event-indicator">
        <span>{eventDates[dateString].length}</span>
      </div>
    ) : null;
  };
  
  // Personalizar estilo da célula do calendário
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dateString = date.toDateString();
    return eventDates[dateString] && eventDates[dateString].length > 0
      ? 'has-events'
      : '';
  };
  
  // Formatar hora do evento
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="event-calendar-container">
      <h2 className="calendar-title">{t('events.calendar')}</h2>
      
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          locale={i18n.language}
          nextLabel={t('calendar.next')}
          prevLabel={t('calendar.prev')}
          next2Label={null}
          prev2Label={null}
          navigationLabel={({ date }) => (
            format(date, 'MMMM yyyy', { locale: currentLocale })
          )}
          formatShortWeekday={(locale, date) => 
            format(date, 'EEEEE', { locale: currentLocale })
          }
        />
      </div>
      
      <div className="selected-date-events">
        <h3 className="selected-date">
          {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: currentLocale })}
        </h3>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : events.length > 0 ? (
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="calendar-event-item">
                <div className="event-time">
                  {formatEventTime(event.start_time)}
                </div>
                
                <div className="event-details">
                  <h4 className="event-title">{event.name}</h4>
                  <p className="event-location">{event.location}</p>
                  
                  <Link to={`/events/${event.id}`} className="event-link">
                    {t('events.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-events">{t('events.noEventsForDate')}</p>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;