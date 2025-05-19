import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  Modal, 
  Button, 
  Alert, 
  Spinner, 
  Icon,
  Form,
  Input
} from '../ui';
import { FaCoins, FaShoppingCart, FaInfoCircle } from 'react-icons/fa';

/**
 * Componente para resgate de recompensas
 */
const RewardRedemption = ({ reward, onConfirm, onClose }) => {
  const { t } = useTranslation();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.rewards.redemption);
  
  const [status, setStatus] = useState('confirmation'); // confirmation, processing, success, error
  const [error, setError] = useState(null);
  const [redemptionCode, setRedemptionCode] = useState(null);
  const [contactInfo, setContactInfo] = useState('');
  
  // Verificar se o usuário pode resgatar a recompensa
  const canRedeem = user && user.amacoins >= reward.amacoins_cost && reward.stock > 0;
  
  const handleConfirm = async () => {
    if (!canRedeem) return;
    
    setStatus('processing');
    
    try {
      // Para recompensas físicas, podemos precisar de informações adicionais
      if (reward.reward_type === 'physical_product' && !contactInfo.trim()) {
        setError(t('rewards.redemption.contactInfoRequired'));
        setStatus('confirmation');
        return;
      }
      
      const result = await onConfirm(reward.id, contactInfo);
      
      if (result && result.redemption) {
        setRedemptionCode(result.redemption.code || result.redemption.id);
        setStatus('success');
      } else {
        throw new Error(t('rewards.redemption.genericError'));
      }
    } catch (err) {
      setError(err.message || t('rewards.redemption.genericError'));
      setStatus('error');
    }
  };
  
  const handleTryAgain = () => {
    setError(null);
    setStatus('confirmation');
  };
  
  const needsContactInfo = reward.reward_type === 'physical_product';
  
  const renderContent = () => {
    if (status === 'success') {
      return (
        <div className="reward-redemption__success">
          <div className="reward-redemption__success-icon">
            <Icon name="check-circle" size={64} color="success" />
          </div>
          <h3>{t('rewards.redemption.success')}</h3>
          <p>{t('rewards.redemption.successMessage')}</p>
          
          {redemptionCode && (
            <div className="reward-redemption__code">
              <p className="reward-redemption__code-label">
                {reward.reward_type === 'digital_service' || reward.reward_type === 'discount_coupon'
                  ? t('rewards.redemption.yourCode')
                  : t('rewards.redemption.yourReference')}
              </p>
              <div className="reward-redemption__code-value">
                {redemptionCode}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(redemptionCode)}
                className="reward-redemption__copy-button"
              >
                {t('common.copy')}
              </Button>
            </div>
          )}
          
          <div className="reward-redemption__instructions">
            <h4>{t('rewards.redemption.nextSteps')}</h4>
            <p>
              {reward.reward_type === 'physical_product'
                ? t('rewards.redemption.physicalInstructions')
                : reward.reward_type === 'digital_service'
                ? t('rewards.redemption.digitalInstructions')
                : t('rewards.redemption.couponInstructions')}
            </p>
          </div>
          
          <Button variant="primary" onClick={onClose} className="mt-4">
            {t('common.close')}
          </Button>
        </div>
      );
    }
    
    if (status === 'error') {
      return (
        <div className="reward-redemption__error">
          <div className="reward-redemption__error-icon">
            <Icon name="alert-circle" size={64} color="danger" />
          </div>
          <h3>{t('rewards.redemption.error')}</h3>
          <p>{error || t('rewards.redemption.errorMessage')}</p>
          <Button variant="outline" onClick={handleTryAgain} className="me-2">
            {t('rewards.redemption.tryAgain')}
          </Button>
          <Button variant="primary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      );
    }
    
    if (status === 'processing' || isLoading) {
      return (
        <div className="reward-redemption__processing">
          <Spinner size="lg" />
          <h3>{t('rewards.redemption.processing')}</h3>
          <p>{t('rewards.redemption.wait')}</p>
        </div>
      );
    }
    
    return (
      <div className="reward-redemption__confirmation">
        <h3>{t('rewards.redemption.confirmTitle')}</h3>
        
        <div className="reward-redemption__reward">
          <h4>{reward.name}</h4>
          <div className="reward-redemption__cost">
            <FaCoins className="reward-redemption__coin-icon" />
            <span>{reward.amacoins_cost}</span>
          </div>
        </div>
        
        {!canRedeem && (
          <Alert variant="danger" className="reward-redemption__alert">
            {!user
              ? t('rewards.redemption.notLoggedIn')
              : reward.stock <= 0
              ? t('rewards.redemption.outOfStock')
              : t('rewards.redemption.notEnoughCoins', { missing: reward.amacoins_cost - user.amacoins })}
          </Alert>
        )}
        
        {user && canRedeem && (
          <div className="reward-redemption__balance">
            <div className="reward-redemption__current">
              <span className="reward-redemption__label">{t('rewards.redemption.currentBalance')}</span>
              <span className="reward-redemption__value">
                <FaCoins className="reward-redemption__coin-icon" />
                {user.amacoins}
              </span>
            </div>
            <div className="reward-redemption__after">
              <span className="reward-redemption__label">{t('rewards.redemption.afterRedemption')}</span>
              <span className="reward-redemption__value">
                <FaCoins className="reward-redemption__coin-icon" />
                {user.amacoins - reward.amacoins_cost}
              </span>
            </div>
          </div>
        )}
        
        {needsContactInfo && canRedeem && (
          <Form className="reward-redemption__form">
            <Form.Group>
              <Form.Label htmlFor="contactInfo">
                {t('rewards.redemption.contactInfoLabel')}
              </Form.Label>
              <Input
                type="text"
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={t('rewards.redemption.contactInfoPlaceholder')}
              />
              <Form.Text>
                <FaInfoCircle className="me-1" />
                {t('rewards.redemption.contactInfoHelp')}
              </Form.Text>
            </Form.Group>
          </Form>
        )}
        
        <div className="reward-redemption__terms">
          <h4>{t('rewards.redemption.termsTitle')}</h4>
          <p>{t('rewards.redemption.termsDescription')}</p>
        </div>
        
        <div className="reward-redemption__actions">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="me-2"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={!canRedeem || (needsContactInfo && !contactInfo.trim())}
          >
            <FaShoppingCart className="me-1" />
            {t('rewards.redemption.confirm')}
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={status === 'confirmation' ? t('rewards.redemption.title') : null}
      size={status === 'success' ? 'md' : 'lg'}
      showHeader={status === 'confirmation'}
      showFooter={false}
    >
      {renderContent()}
    </Modal>
  );
};

RewardRedemption.propTypes = {
  reward: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    reward_type: PropTypes.string.isRequired,
    amacoins_cost: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default RewardRedemption;