import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Badge, 
  Tabs, 
  TabPane, 
  ImageGallery,
  Skeleton, 
  Icon,
  Alert
} from '../ui';
import { formatDate } from '../../utils/formatters';
import RewardRedemption from './RewardRedemption';
import PartnerBadge from './PartnerBadge';
import { FaCoins, FaStore, FaCalendarAlt, FaShareAlt, FaShoppingCart } from 'react-icons/fa';

/**
 * Componente para exibição detalhada de uma recompensa
 */
const RewardDetail = ({ 
  reward, 
  isLoading, 
  error, 
  onRedeem,
  onShare
}) => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('info');
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  
  // Verifica se o usuário pode resgatar a recompensa
  const canRedeem = user && user.amacoins >= reward?.amacoins_cost && reward?.stock > 0;
  
  useEffect(() => {
    // Scroll to top when reward changes
    window.scrollTo(0, 0);
  }, [reward?.id]);

  if (isLoading) {
    return (
      <div className="reward-detail reward-detail--loading">
        <Skeleton height={300} className="reward-detail__image-skeleton" />
        <Skeleton height={50} width={300} className="reward-detail__title-skeleton" />
        <Skeleton count={3} height={20} className="reward-detail__text-skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="reward-detail reward-detail--error">
        <div className="reward-detail__error">
          <Icon name="alert-triangle" size={48} />
          <h3>{t('rewards.loadError')}</h3>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </Card>
    );
  }

  if (!reward) return null;

  const handleRedeemClick = () => {
    if (isAuthenticated) {
      if (canRedeem) {
        setShowRedemptionModal(true);
      }
    } else {
      // Redirect to login page
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  };

  const handleRedemptionConfirm = async () => {
    await onRedeem(reward.id);
    setShowRedemptionModal(false);
  };

  const handleShare = () => {
    if (onShare) {
      onShare(reward.id, reward.name);
    }
  };

  // Formata a validade da recompensa
  const formatExpiration = (dateString) => {
    if (!dateString) return '';
    const expirationDate = new Date(dateString);
    const today = new Date();
    
    // Calcula a diferença em dias
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return t('rewards.expired');
    } else if (diffDays === 1) {
      return t('rewards.expiresInOneDay');
    } else if (diffDays <= 7) {
      return t('rewards.expiresInDays', { days: diffDays });
    } else {
      return t('rewards.expiresOn', { date: expirationDate.toLocaleDateString() });
    }
  };

  const images = reward.images || [{ url: reward.image_url || '/images/reward-placeholder.jpg', alt: reward.name }];

  return (
    <div className="reward-detail">
      <div className="reward-detail__header">
        <ImageGallery 
          images={images} 
          className="reward-detail__gallery"
        />
        
        <div className="reward-detail__actions">
          <Button 
            variant="outline" 
            className="reward-detail__action-button"
            onClick={handleShare}
          >
            <FaShareAlt /> {t('rewards.share')}
          </Button>
          
          <Button 
            variant="primary" 
            className="reward-detail__action-button reward-detail__redeem-button"
            disabled={!canRedeem}
            onClick={handleRedeemClick}
          >
            <FaShoppingCart /> {t('rewards.redeem')}
          </Button>
        </div>
      </div>
      
      <div className="reward-detail__content">
        <div className="reward-detail__title-section">
          <h1 className="reward-detail__title">{reward.name}</h1>
          
          <div className="reward-detail__badges">
            <Badge variant="info">
              {t(`rewards.types.${reward.reward_type}`)}
            </Badge>
            
            {reward.is_featured && (
              <Badge variant="primary" className="ms-2">
                {t('rewards.featured')}
              </Badge>
            )}
            
            <div className="reward-detail__cost">
              <FaCoins className="reward-detail__coin-icon" />
              <span className="reward-detail__cost-value">{reward.amacoins_cost}</span>
              <span className="reward-detail__cost-label">{t('common.amacoins')}</span>
            </div>
          </div>
          
          {reward.partner_name && (
            <div className="reward-detail__partner">
              <FaStore className="reward-detail__partner-icon" />
              <PartnerBadge 
                partner={{ 
                  name: reward.partner_name, 
                  id: reward.partner_id 
                }} 
                showLink 
              />
            </div>
          )}
        </div>
        
        {reward.stock <= 5 && reward.stock > 0 ? (
          <Alert variant="warning" className="reward-detail__stock-alert">
            {t('rewards.limitedStock', { count: reward.stock })}
          </Alert>
        ) : reward.stock <= 0 ? (
          <Alert variant="danger" className="reward-detail__stock-alert">
            {t('rewards.outOfStock')}
          </Alert>
        ) : null}
        
        {reward.expiration_date && (
          <Alert variant="info" className="reward-detail__expiration-alert">
            <FaCalendarAlt className="me-2" />
            {formatExpiration(reward.expiration_date)}
          </Alert>
        )}
        
        {user && (
          <Card className="reward-detail__amacoins-card">
            <div className="reward-detail__amacoins-status">
              <div className="reward-detail__amacoins-balance">
                <span className="reward-detail__amacoins-label">{t('rewards.yourBalance')}</span>
                <span className="reward-detail__amacoins-value">
                  <FaCoins className="reward-detail__coin-icon" />
                  {user.amacoins}
                </span>
              </div>
              
              {user.amacoins < reward.amacoins_cost ? (
                <div className="reward-detail__amacoins-needed">
                  <span className="reward-detail__amacoins-label">{t('rewards.youNeed')}</span>
                  <span className="reward-detail__amacoins-value reward-detail__amacoins-value--needed">
                    <FaCoins className="reward-detail__coin-icon" />
                    {reward.amacoins_cost - user.amacoins} {t('rewards.more')}
                  </span>
                </div>
              ) : (
                <div className="reward-detail__amacoins-sufficient">
                  <Badge variant="success">
                    {t('rewards.youHaveEnough')}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        )}
        
        <Tabs active={activeTab} onChange={setActiveTab}>
          <TabPane id="info" title={t('rewards.information')}>
            <Card className="reward-detail__info-card">
              <h3>{t('rewards.about')}</h3>
              <div className="reward-detail__description">
                {reward.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {reward.how_to_use && (
                <div className="reward-detail__section">
                  <h4>{t('rewards.howToUse')}</h4>
                  <div className="reward-detail__how-to-use">
                    {reward.how_to_use.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {reward.terms && (
                <div className="reward-detail__section">
                  <h4>{t('rewards.terms')}</h4>
                  <div className="reward-detail__terms">
                    {reward.terms.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {reward.additional_info && (
                <div className="reward-detail__section">
                  <h4>{t('rewards.additionalInfo')}</h4>
                  <div className="reward-detail__additional-info">
                    {reward.additional_info.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabPane>
          
          <TabPane id="related" title={t('rewards.related')}>
            <Card className="reward-detail__related-card">
              <p>{t('rewards.comingSoon')}</p>
            </Card>
          </TabPane>
        </Tabs>
      </div>
      
      {showRedemptionModal && (
        <RewardRedemption
          reward={reward}
          onConfirm={handleRedemptionConfirm}
          onClose={() => setShowRedemptionModal(false)}
        />
      )}
    </div>
  );
};

RewardDetail.propTypes = {
  reward: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        alt: PropTypes.string
      })
    ),
    reward_type: PropTypes.string.isRequired,
    amacoins_cost: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    is_featured: PropTypes.bool,
    partner_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    partner_name: PropTypes.string,
    expiration_date: PropTypes.string,
    how_to_use: PropTypes.string,
    terms: PropTypes.string,
    additional_info: PropTypes.string
  }),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRedeem: PropTypes.func.isRequired,
  onShare: PropTypes.func
};

export default RewardDetail;