import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Button,
  Select,
  Input,
  Switch
} from '../ui';
import { FaWifi, FaSearch, FaHandshake, FaSortAmountDown, FaSortAlphaDown } from 'react-icons/fa';
import { useDebounce } from '../../hooks';

/**
 * Componente para filtragem de locais
 */
const PlaceFilter = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState(filters);
  const debouncedSearch = useDebounce(localFilters.search, 500);
  
  // Opções de tipos de locais
  const placeTypeOptions = [
    { value: '', label: t('places.filter.allTypes') },
    { value: 'tourist_spot', label: t('places.types.tourist_spot') },
    { value: 'restaurant', label: t('places.types.restaurant') },
    { value: 'shop', label: t('places.types.shop') },
    { value: 'cultural_venue', label: t('places.types.cultural_venue') }
  ];
  
  // Opções de ordenação
  const sortingOptions = [
    { value: 'distance', label: t('places.filter.sortByDistance') },
    { value: 'name', label: t('places.filter.sortByName') },
    { value: 'amacoins', label: t('places.filter.sortByAmacoins') },
    { value: 'rating', label: t('places.filter.sortByRating') }
  ];
  
  // Sincroniza o estado local com as props quando as props mudam
  useEffect(() => {
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      ...filters
    }));
  }, [filters]);
  
  // Aplica o termo de busca debounced
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...localFilters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, localFilters, onChange]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setLocalFilters({
      ...localFilters,
      [name]: newValue
    });
    
    // Para checkboxes e selects, aplicamos imediatamente
    if (type === 'checkbox' || type === 'select-one') {
      onChange({
        ...localFilters,
        [name]: newValue
      });
    }
  };
  
  const handleReset = () => {
    const resetFilters = {
      type: '',
      wifi: false,
      partner: false,
      search: '',
      sorting: 'distance'
    };
    
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  return (
    <Card className="place-filter">
      <Form>
        <Row className="align-items-end">
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label htmlFor="search">
                <FaSearch className="me-1" />
                {t('places.filter.search')}
              </Form.Label>
              <Input
                type="text"
                id="search"
                name="search"
                value={localFilters.search}
                onChange={handleInputChange}
                placeholder={t('places.filter.searchPlaceholder')}
              />
            </Form.Group>
          </Col>
          
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label htmlFor="type">
                {t('places.filter.type')}
              </Form.Label>
              <Select
                id="type"
                name="type"
                value={localFilters.type}
                onChange={handleInputChange}
                options={placeTypeOptions}
              />
            </Form.Group>
          </Col>
          
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label htmlFor="sorting">
                <FaSortAmountDown className="me-1" />
                {t('places.filter.sortBy')}
              </Form.Label>
              <Select
                id="sorting"
                name="sorting"
                value={localFilters.sorting}
                onChange={handleInputChange}
                options={sortingOptions}
              />
            </Form.Group>
          </Col>
          
          <Col md={3} sm={6}>
            <div className="place-filter__toggles">
              <Form.Group className="d-flex align-items-center">
                <Switch
                  id="wifi"
                  name="wifi"
                  checked={localFilters.wifi}
                  onChange={handleInputChange}
                  label={
                    <>
                      <FaWifi className="me-1" />
                      {t('places.filter.wifiAvailable')}
                    </>
                  }
                />
              </Form.Group>
              
              <Form.Group className="d-flex align-items-center mt-2">
                <Switch
                  id="partner"
                  name="partner"
                  checked={localFilters.partner}
                  onChange={handleInputChange}
                  label={
                    <>
                      <FaHandshake className="me-1" />
                      {t('places.filter.partnerPlaces')}
                    </>
                  }
                />
              </Form.Group>
            </div>
          </Col>
        </Row>
        
        <div className="place-filter__actions">
          <Button
            variant="link"
            onClick={handleReset}
            className="place-filter__reset"
          >
            {t('common.resetFilters')}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

PlaceFilter.propTypes = {
  filters: PropTypes.shape({
    type: PropTypes.string,
    wifi: PropTypes.bool,
    partner: PropTypes.bool,
    search: PropTypes.string,
    sorting: PropTypes.string
  }),
  onChange: PropTypes.func.isRequired
};

PlaceFilter.defaultProps = {
  filters: {
    type: '',
    wifi: false,
    partner: false,
    search: '',
    sorting: 'distance'
  }
};

export default PlaceFilter;