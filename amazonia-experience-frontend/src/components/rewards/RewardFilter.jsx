import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Button,
  Select,
  Input,
  Slider,
  Switch
} from '../ui';
import { FaSearch, FaCoins, FaStore, FaSortAmountDown } from 'react-icons/fa';
import { useDebounce } from '../../hooks';

/**
 * Componente para filtragem de recompensas
 */
const RewardFilter = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState(filters);
  const debouncedSearch = useDebounce(localFilters.search, 500);
  const { user } = useSelector(state => state.auth);
  
  // Buscar parceiros para filtro
  const { partners } = useSelector(state => state.partners);
  
  // Opções de tipos de recompensas
  const rewardTypeOptions = [
    { value: '', label: t('rewards.filter.allTypes') },
    { value: 'physical_product', label: t('rewards.types.physical_product') },
    { value: 'digital_service', label: t('rewards.types.digital_service') },
    { value: 'discount_coupon', label: t('rewards.types.discount_coupon') },
    { value: 'experience', label: t('rewards.types.experience') }
  ];
  
  // Opções de parceiros
  const partnerOptions = [
    { value: '', label: t('rewards.filter.allPartners') },
    ...(partners?.map(partner => ({
      value: partner.id.toString(),
      label: partner.business_name
    })) || [])
  ];
  
  // Opções de ordenação
  const sortingOptions = [
    { value: 'amacoins', label: t('rewards.filter.sortByAmacoins') },
    { value: 'name', label: t('rewards.filter.sortByName') },
    { value: 'newest', label: t('rewards.filter.sortByNewest') }
  ];
  
  // Opções de custo máximo em AmaCoins
  const maxCostOptions = [
    { value: '', label: t('rewards.filter.anyPrice') },
    { value: '50', label: `≤ 50 ${t('common.amacoins')}` },
    { value: '100', label: `≤ 100 ${t('common.amacoins')}` },
    { value: '200', label: `≤ 200 ${t('common.amacoins')}` },
    { value: '500', label: `≤ 500 ${t('common.amacoins')}` },
    { value: '1000', label: `≤ 1000 ${t('common.amacoins')}` }
  ];
  
  // Se o usuário estiver logado, adicionar uma opção para mostrar apenas o que o usuário pode pagar
  if (user) {
    maxCostOptions.splice(1, 0, { 
      value: user.amacoins.toString(), 
      label: t('rewards.filter.whatICanAfford') 
    });
  }
  
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
      partner: '',
      maxCost: '',
      inStock: true,
      search: '',
      sorting: 'amacoins'
    };
    
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  return (
    <Card className="reward-filter">
      <Form>
        <Row className="align-items-end">
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label htmlFor="search">
                <FaSearch className="me-1" />
                {t('rewards.filter.search')}
              </Form.Label>
              <Input
                type="text"
                id="search"
                name="search"
                value={localFilters.search}
                onChange={handleInputChange}
                placeholder={t('rewards.filter.searchPlaceholder')}
              />
            </Form.Group>
          </Col>
          
          <Col md={3} sm={6}>
            <Form.Group>
              <Form.Label htmlFor="type">
                {t('rewards.filter.type')}
              </Form.Label>
              <Select
                id="type"
                name="type"
                value={localFilters.type}
                onChange={handleInputChange}
                options={rewardTypeOptions}
              />
            </Form.Group>
          </Col>
          
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label htmlFor="partner">
                <FaStore className="me-1" />
                {t('rewards.filter.partner')}
              </Form.Label>
              <Select
                id="partner"
                name="partner"
                value={localFilters.partner}
                onChange={handleInputChange}
                options={partnerOptions}
              />
            </Form.Group>
          </Col>
          
          <Col md={2} sm={6}>
            <Form.Group>
              <Form.Label htmlFor="maxCost">
                <FaCoins className="me-1" />
                {t('rewards.filter.maxCost')}
              </Form.Label>
              <Select
                id="maxCost"
                name="maxCost"
                value={localFilters.maxCost}
                onChange={handleInputChange}
                options={maxCostOptions}
              />
            </Form.Group>
          </Col>
          
          <Col md={2} sm={6}>
            <div className="reward-filter__toggles">
              <Form.Group>
                <Form.Label htmlFor="sorting">
                  <FaSortAmountDown className="me-1" />
                  {t('rewards.filter.sortBy')}
                </Form.Label>
                <Select
                  id="sorting"
                  name="sorting"
                  value={localFilters.sorting}
                  onChange={handleInputChange}
                  options={sortingOptions}
                />
              </Form.Group>
              
              <Form.Group className="d-flex align-items-center mt-2">
                <Switch
                  id="inStock"
                  name="inStock"
                  checked={localFilters.inStock}
                  onChange={handleInputChange}
                  label={t('rewards.filter.inStockOnly')}
                />
              </Form.Group>
            </div>
          </Col>
        </Row>
        
        <div className="reward-filter__actions">
          <Button
            variant="link"
            onClick={handleReset}
            className="reward-filter__reset"
          >
            {t('common.resetFilters')}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

RewardFilter.propTypes = {
  filters: PropTypes.shape({
    type: PropTypes.string,
    partner: PropTypes.string,
    maxCost: PropTypes.string,
    inStock: PropTypes.bool,
    search: PropTypes.string,
    sorting: PropTypes.string
  }),
  onChange: PropTypes.func.isRequired
};

RewardFilter.defaultProps = {
  filters: {
    type: '',
    partner: '',
    maxCost: '',
    inStock: true,
    search: '',
    sorting: 'amacoins'
  }
};

export default RewardFilter;