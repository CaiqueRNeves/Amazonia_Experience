import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  WifiIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ConnectivityFilter = ({ filters, onFilterChange }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    wifi_speed: '',
    is_free: false,
    is_verified: false,
    ...filters
  });
  
  // Sincronizar com filtros externos
  useEffect(() => {
    setLocalFilters({
      search: '',
      wifi_speed: '',
      is_free: false,
      is_verified: false,
      ...filters
    });
  }, [filters]);
  
  // Opções de velocidade de WiFi
  const wifiSpeedOptions = [
    { value: '', label: t('connectivity.filterAllSpeeds') },
    { value: 'fast', label: t('connectivity.speeds.fast') },
    { value: 'medium', label: t('connectivity.speeds.medium') },
    { value: 'slow', label: t('connectivity.speeds.slow') }
  ];
  
  // Manipular mudanças nos filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setLocalFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      wifi_speed: '',
      is_free: false,
      is_verified: false,
      page: 1
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  // Verificar se algum filtro está ativo
  const hasActiveFilters = () => {
    return (
      localFilters.search || 
      localFilters.wifi_speed || 
      localFilters.is_free || 
      localFilters.is_verified
    );
  };
  
  // Manipular envio do formulário de busca
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="connectivity-filters">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            name="search"
            value={localFilters.search}
            onChange={handleFilterChange}
            placeholder={t('connectivity.searchPlaceholder')}
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
          aria-label={t('connectivity.toggleFilters')}
        >
          <FunnelIcon className="icon" />
        </button>
      </form>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="wifi-speed">{t('connectivity.filterSpeed')}</label>
              <select
                id="wifi-speed"
                name="wifi_speed"
                value={localFilters.wifi_speed}
                onChange={handleFilterChange}
                className="form-select"
              >
                {wifiSpeedOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="is_free"
                  name="is_free"
                  checked={localFilters.is_free}
                  onChange={handleFilterChange}
                  className="form-checkbox"
                />
                <label htmlFor="is_free">{t('connectivity.filterFree')}</label>
              </div>
            </div>
            
            <div className="filter-group">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="is_verified"
                  name="is_verified"
                  checked={localFilters.is_verified}
                  onChange={handleFilterChange}
                  className="form-checkbox"
                />
                <label htmlFor="is_verified">{t('connectivity.filterVerified')}</label>
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
            {t('connectivity.activeFilters')}:
          </div>
          
          <div className="filter-tags">
            {localFilters.search && (
              <div className="filter-tag">
                <span>{t('connectivity.searchFilter')}: {localFilters.search}</span>
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
            
            {localFilters.wifi_speed && (
              <div className="filter-tag">
                <span>
                  {t('connectivity.speedFilter')}: {wifiSpeedOptions.find(opt => opt.value === localFilters.wifi_speed)?.label}
                </span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, wifi_speed: '' }));
                    onFilterChange({ ...localFilters, wifi_speed: '', page: 1 });
                  }}
                  aria-label={t('common.remove')}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
            )}
            
            {localFilters.is_free && (
              <div className="filter-tag">
                <span>{t('connectivity.filterFree')}</span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, is_free: false }));
                    onFilterChange({ ...localFilters, is_free: false, page: 1 });
                  }}
                  aria-label={t('common.remove')}
                >
                  <XMarkIcon className="icon" />
                </button>
              </div>
            )}
            
            {localFilters.is_verified && (
              <div className="filter-tag">
                <span>{t('connectivity.filterVerified')}</span>
                <button
                  onClick={() => {
                    setLocalFilters(prev => ({ ...prev, is_verified: false }));
                    onFilterChange({ ...localFilters, is_verified: false, page: 1 });
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

export default ConnectivityFilter;