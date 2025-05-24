import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Pagination, 
  Loader, 
  EmptyState,
  Tabs,
  TabPane
} from '../ui';
import RewardCard from './RewardCard';
import RewardFilter from './RewardFilter';
import RewardRedemption from './RewardRedemption';

/**
 * Componente para listar recompensas
 */
const RewardList = ({ 
  rewards, 
  isLoading, 
  error, 
  totalPages, 
  currentPage, 
  onPageChange, 
  onFilterChange,
  onRedeem
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    type: '',
    partner: '',
    maxCost: '',
    inStock: true,
    search: '',
    sorting: 'amacoins'
  });
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'physical', 'digital'
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    if (onFilterChange) {
      onFilterChange({ ...filters, ...newFilters });
    }
  };
  
  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowRedemptionModal(true);
  };
  
  const handleRedemptionConfirm = async () => {
    if (selectedReward && onRedeem) {
      await onRedeem(selectedReward.id);
      setShowRedemptionModal(false);
    }
  };
  
  const filteredRewards = () => {
    if (!rewards) return [];
    
    // Filtrar por tipo de recompensa com base na tab selecionada
    if (activeTab === 'physical') {
      return rewards.filter(reward => reward.reward_type === 'physical_product');
    } else if (activeTab === 'digital') {
      return rewards.filter(reward => 
        reward.reward_type === 'digital_service' || 
        reward.reward_type === 'discount_coupon'
      );
    }
    
    return rewards;
  };

  if (error) {
    return (
      <Card className="reward-list__error">
        <h3>{t('rewards.loadError')}</h3>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="reward-list__loading">
        <Loader message={t('rewards.loading')} />
      </div>
    );
  }

  if (!rewards || rewards.length === 0) {
    return (
      <EmptyState
        icon="gift"
        title={t('rewards.noRewardsFound')}
        description={t('rewards.tryAdjustingFilters')}
        action={
          <Button onClick={() => handleFilterChange({ type: '', partner: '', maxCost: '', search: '' })}>
            {t('rewards.clearFilters')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="reward-list">
      <div className="reward-list__header">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <h2>{t('rewards.exploreTitle')}</h2>
              <p className="text-muted">
                {t('rewards.foundCount', { count: filteredRewards().length })}
              </p>
            </Col>
          </Row>
        </Container>
      </div>
      
      <div className="reward-list__filters">
        <RewardFilter 
          filters={filters} 
          onChange={handleFilterChange} 
        />
      </div>
      
      <div className="reward-list__tabs">
        <Tabs active={activeTab} onChange={setActiveTab}>
          <TabPane id="all" title={t('rewards.allRewards')}>
            <div className="reward-list__grid">
              <Container fluid>
                <Row>
                  {filteredRewards().map(reward => (
                    <Col key={reward.id} lg={4} md={6} sm={12} className="mb-4">
                      <RewardCard 
                        reward={reward} 
                        onRedeem={handleRedeemClick}
                      />
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>
          </TabPane>
          
          <TabPane id="physical" title={t('rewards.physicalRewards')}>
            <div className="reward-list__grid">
              <Container fluid>
                <Row>
                  {filteredRewards().map(reward => (
                    <Col key={reward.id} lg={4} md={6} sm={12} className="mb-4">
                      <RewardCard 
                        reward={reward} 
                        onRedeem={handleRedeemClick}
                      />
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>
          </TabPane>
          
          <TabPane id="digital" title={t('rewards.digitalRewards')}>
            <div className="reward-list__grid">
              <Container fluid>
                <Row>
                  {filteredRewards().map(reward => (
                    <Col key={reward.id} lg={4} md={6} sm={12} className="mb-4">
                      <RewardCard 
                        reward={reward} 
                        onRedeem={handleRedeemClick}
                      />
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      {totalPages > 1 && (
        <div className="reward-list__pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            siblingCount={1}
          />
        </div>
      )}
      
      {showRedemptionModal && selectedReward && (
        <RewardRedemption
          reward={selectedReward}
          onConfirm={handleRedemptionConfirm}
          onClose={() => setShowRedemptionModal(false)}
        />
      )}
    </div>
  );
};

RewardList.propTypes = {
  rewards: PropTypes.arrayOf(PropTypes.object),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  totalPages: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onFilterChange: PropTypes.func,
  onRedeem: PropTypes.func
};

export default RewardList;