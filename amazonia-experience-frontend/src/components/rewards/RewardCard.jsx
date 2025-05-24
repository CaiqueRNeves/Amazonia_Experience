import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card, Badge, Button, Image } from '../ui';
import { FaCoins, FaStore, FaCalendarAlt } from 'react-icons/fa';
import PartnerBadge from './PartnerBadge';

/**
 * Componente de cartão para exibir uma recompensa na listagem
 */
const RewardCard = ({ reward, compact = false, onRedeem }) => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const canRedeem = user && user.amacoins >= reward.amacoins_cost && reward.stock > 0;

  if (!reward) return null;

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

  return (
    <Card className={`reward-card ${compact ? 'reward-card--compact' : ''}`}>
      <div className="reward-card__image-container">
        <Image
          src={reward.image_url || '/images/reward-placeholder.jpg'}
          alt={reward.name}
          className="reward-card__image"
        />
        
        {reward.is_featured && (
          <Badge variant="primary" className="reward-card__featured-badge">
            {t('rewards.featured')}
          </Badge>
        )}
        
        <div className="reward-card__cost-badge">
          <FaCoins className="reward-card__coin-icon" />
          <span>{reward.amacoins_cost}</span>
        </div>
      </div>

      <div className="reward-card__content">
        <h3 className="reward-card__title">{reward.name}</h3>
        
        <div className="reward-card__type">
          <Badge variant="info">
            {t(`rewards.types.${reward.reward_type}`)}
          </Badge>
        </div>
        
        {!compact && (
          <p className="reward-card__description">
            {reward.description.length > 120
              ? `${reward.description.substring(0, 120)}...`
              : reward.description}
          </p>
        )}
        
        {reward.partner_name && (
          <div className="reward-card__partner">
            <FaStore className="reward-card__partner-icon" />
            <PartnerBadge partner={{ name: reward.partner_name, id: reward.partner_id }} />
          </div>
        )}
        
        {reward.expiration_date && (
          <div className="reward-card__expiration">
            <FaCalendarAlt className="reward-card__calendar-icon" />
            <span className="reward-card__expiration-text">
              {formatExpiration(reward.expiration_date)}
            </span>
          </div>
        )}
        
        <div className="reward-card__stock">
          {reward.stock <= 5 && reward.stock > 0 ? (
            <Badge variant="warning">
              {t('rewards.limitedStock', { count: reward.stock })}
            </Badge>
          ) : reward.stock <= 0 ? (
            <Badge variant="danger">
              {t('rewards.outOfStock')}
            </Badge>
          ) : (
            <Badge variant="success">
              {t('rewards.inStock')}
            </Badge>
          )}
        </div>
      </div>

      <div className="reward-card__footer">
        <Link to={`/rewards/${reward.id}`} className="reward-card__link">
          <Button variant="outline" className="reward-card__button">
            {t('rewards.viewDetails')}
          </Button>
        </Link>
        
        {onRedeem && (
          <Button 
            variant="primary" 
            className="reward-card__redeem-button"
            disabled={!canRedeem}
            onClick={() => onRedeem(reward)}
            title={!canRedeem ? 
              (user ? 
                (reward.stock <= 0 ? 
                  t('rewards.outOfStock') :
                  t('rewards.notEnoughAmacoins', { missing: reward.amacoins_cost - user.amacoins })
                ) : 
                t('rewards.loginToRedeem')
              ) : 
              t('rewards.redeem')
            }
          >
            {t('rewards.redeem')}
          </Button>
        )}
      </div>
      
      {user && !compact && (
        <div className="reward-card__amacoins-status">
          {user.amacoins < reward.amacoins_cost ? (
            <div className="reward-card__insufficient">
              <FaCoins className="reward-card__coin-icon reward-card__coin-icon--insufficient" />
              <span>{t('rewards.youNeed')} {reward.amacoins_cost - user.amacoins} {t('rewards.more')}</span>
            </div>
          ) : (
            <div className="reward-card__sufficient">
              <FaCoins className="reward-card__coin-icon reward-card__coin-icon--sufficient" />
              <span>{t('rewards.youHaveEnough')}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

RewardCard.propTypes = {
  reward: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image_url: PropTypes.string,
    reward_type: PropTypes.string.isRequired,
    amacoins_cost: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    is_featured: PropTypes.bool,
    partner_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    partner_name: PropTypes.string,
    expiration_date: PropTypes.string
  }).isRequired,
  compact: PropTypes.bool,
  onRedeem: PropTypes.func
};

export default RewardCard;