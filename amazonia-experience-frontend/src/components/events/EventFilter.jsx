import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EventFilter = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    event_type: '',
    featured: false,
    start_date: null,
    end_date: null,
    ...filters
  });
  
  // Sincronizar com filtros externos
  useEffect(() => {
    setLocalFilters({
      search: '',
      event_type: '',
      featured: false,
      start_date: null,
      end_date: null,
      ...filters
    });
  }, [filters]);
  
  // Opções de tipos de eventos
  const eventTypes = [
    { value: '', label: t('events.filterAllTypes') },
    { value: 'conference', label: t('events.types.conference') },
    { value: 'panel', label: t('events.types.panel') },
    { value: 'workshop', label: t('events.types.workshop') },
    { value: 'exhibition', label: t('events.types.exhibition') },
    { value: 'cultural', label: t('events.types.cultural') },
    { value: 'social', label: t('events.types.social') }
  ];
  
  // Manipular mudanças nos filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Manipular mudança nas datas
  const handleDateChange = (name, date) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    onFilterChange({
      ...localFilters,
      page: 1 // Resetar para a primeira página ao aplicar filtros
    });
  };
  
  // Limpar filtros
  const clearFilters = () => {
    const resetFilters = {
      search: '',
      event_type: '',
      featured: false,
      start_date: null,
      end_date: null,
      page: 1
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  // Verificar se algum filtro está ativo
  const hasActiveFilters = () => {
    return (
      localFilters.search || 
      localFilters.event_type || 
      localFilters.featured || 
      localFilters.start_date || 
      localFilters.end_date
    );
  };
  
  // Manipular envio do formulário de busca
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="event-filters">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            name="search"
            value={localFilters.search}
            onChange={handleFilterChange}
            placeholder={t('events.searchPlaceholder')}
            className="search-input"
          />
          {localFilters.search && (
            <button
              type="button"
              onClick={() => {
                setLocalFilters(prev => ({ ...prev, search: '' }));
                onFilterChange({ ...localFilters, search: '', page: 1 });
              }}
              className="clear-search-button"
              aria-label={t('common.clear')}
            >
              <XMarkIcon className="icon" />
            </button>
          )}
        </div>
        
        <button type="submit" className="btn btn-primary search-button">
          {t('common.search')}
        </button>
        
        <button 
          type="button" 
          className={`btn btn-icon filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-label={t('events.toggleFilters')}
        >
          <FunnelIcon className="icon" />
        </button>
      </form>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="event-type">{t('events.filterType')}</label>
              <select
                id="event-type"
                name="event_type"
                value={localFilters.event_type}
                onChange={handleFilterChange}
                className="form-select"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={localFilters.featured}
                  onChange={handleFilterChange}
                  className="form-checkbox"
                />
                <label htmlFor="featured">{t('events.filterFeatured')}</label>
              </div>
            </div>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="start-date">{t('events.filterStartDate')}</label>
              <div className="date-picker-container">
                <CalendarIcon className="calendar-icon" />
                <DatePicker
                  id="start-date"
                  selected={localFilters.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  selectsStart
                  startDate={localFilters.start_date}
                  endDate={localFilters.end_date}
                  placeholderText={t('events.startDatePlaceholder')}
                  className="form-input"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label htmlFor="end-date">{t('events.filterEndDate')}</label>
              <div className="date-picker-container">
                <CalendarIcon className="calendar-icon" />
                <DatePicker
                  id="end-date"
                  selected={localFilters.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  selectsEnd
                  startDate={localFilters.start_date}
                  endDate={localFilters.end_date}
                  minDate={localFilters.start_date}
                  placeholderText={t('events.endDatePlaceholder')}
                  className="form-input"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>
          </div>
          
          <div className="filters-actions">
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-outline"
              disabled={!hasActiveFilters()}
            >
              {t('common.clear')}
            </button>
            
            <button
              type="button"
              onClick={applyFilters}
              className="btn btn-primary"
            >
              {t('common.apply')}
            </button>
          </div>
        </div>
      )}
      
      {hasActiveFilters() && (
        <div className="active-filters">
          <div className="active-filters-label">
            {t('events.activeFilters')}:
          </div>
          
          <div className="filter-tags">
            {localFilters.search && (
              <div className="filter-tag">
                <span>{t('events.searchFilter')}: {localFilters.search}</span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, search: '' }));
                    onFilterChange({ ...localFilters, search: '', page: 1 });
                  }}
                  aria-label={t('common.remove')}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
            )}
            
            {localFilters.event_type && (
              <div className="filter-tag">
                <span>
                  {t('events.typeFilter')}: {eventTypes.find(t => t.value === localFilters.event_type)?.label}
                </span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, event_type: '' }));
                    onFilterChange({ ...localFilters, event_type: '', page: 1 });
                  }}
                  aria-label={t('common.remove')}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
            )}
            
            {localFilters.featured && (
              <div className="filter-tag">
                <span>{t('events.filterFeatured')}</span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, featured: false }));
                    onFilterChange({ ...localFilters, featured: false, page: 1 });
                  }}
                  aria-label={t('common.remove')}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
            )}
            
            {localFilters.start_date && (
              <div className="filter-tag">
                <span>
                  {t('events.startFromFilter')}: {localFilters.start_date.toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, start_date: null }));
                    onFilterChange({ ...localFilters, start_date: null, page: 1 });
                  }}
                  aria-label={t('common.remove')}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
            )}
            
            {localFilters.end_date && (
              <div className="filter-tag">
                <span>
                  {t('events.endByFilter')}: {localFilters.end_date.toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, end_date: null }));
                    onFilterChange({ ...localFilters, end_date: null, page: 1 });
                  }}
                  aria-label={t('common.remove')}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={clearFilters}
            className="btn btn-sm btn-text"
          >
            {t('common.clearAll')}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventFilter;