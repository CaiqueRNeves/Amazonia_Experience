import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  ChevronRightIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  MuseumIcon,
  MusicalNoteIcon,
  GlobeAmericasIcon
} from '@heroicons/react/24/outline';

import { eventService } from '../../services';
import EventCard from './EventCard';
import Loader from '../common/Loader';

const EventCategoryList = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('conference');
  const [categoryEvents, setCategoryEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Definição das categorias de eventos
  const categories = [
    { 
      id: 'conference', 
      name: t('events.types.conference'),
      icon: <PresentationChartBarIcon className="icon" />
    },
    { 
      id: 'panel', 
      name: t('events.types.panel'),
      icon: <UserGroupIcon className="icon" />
    },
    { 
      id: 'workshop', 
      name: t('events.types.workshop'),
      icon: <AcademicCapIcon className="icon" />
    },
    { 
      id: 'exhibition', 
      name: t('events.types.exhibition'),
      icon: <MuseumIcon className="icon" />
    },
    { 
      id: 'cultural', 
      name: t('events.types.cultural'),
      icon: <MusicalNoteIcon className="icon" />
    },
    { 
      id: 'social', 
      name: t('events.types.social'),
      icon: <GlobeAmericasIcon className="icon" />
    }
  ];
  
  // Carregar eventos da categoria selecionada
  useEffect(() => {
    const fetchCategoryEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEventsByType(activeCategory, { limit: 4 });
        setCategoryEvents(response.events || []);
        setError(null);
      } catch (err) {
        setError(err.message || t('events.categoryLoadError'));
        setCategoryEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryEvents();
  }, [activeCategory, t]);
  
  // Trocar de categoria
  const changeCategory = (categoryId) => {
    setActiveCategory(categoryId);
  };
  
  // Formatar data do evento
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="event-category-container">
      <h2 className="section-title">{t('events.categories')}</h2>
      
      <div className="category-navigation">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => changeCategory(category.id)}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>
      
      <div className="category-events">
        <div className="category-header">
          <h3 className="category-title">
            {categories.find(c => c.id === activeCategory)?.name}
          </h3>
          
          <Link to={`/events?event_type=${activeCategory}`} className="view-all-link">
            {t('common.viewAll')}
            <ChevronRightIcon className="icon" />
          </Link>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <Loader />
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : categoryEvents.length > 0 ? (
          <div className="category-events-grid">
            {categoryEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                formatDate={formatEventDate} 
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{t('events.noCategoryEvents', { category: categories.find(c => c.id === activeCategory)?.name })}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCategoryList;