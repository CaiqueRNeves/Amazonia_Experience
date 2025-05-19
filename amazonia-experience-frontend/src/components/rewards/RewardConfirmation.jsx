import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Button, 
  Alert, 
  Icon,
  QRCode,
  Tabs,
  TabPane
} from '../ui';
import { FaQrcode, FaBarcode, FaCopy, FaDownload, FaShare } from 'react-icons/fa';

/**
 * Componente para exibir confirmação após resgate da recompensa
 */
const RewardConfirmation = ({ 
  redemption, 
  reward, 
  onClose, 
  onDownload, 
  onShare 
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('details');
  const [copied, setCopied] = useState(false);
  
  // Reset copied state after a delay
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copied]);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(redemption.code);
    setCopied(true);
  };
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload(redemption);
    }
  };
  
  const handleShare = () => {
    if (onShare) {
      onShare(redemption);
    }
  };
  
  if (!redemption || !reward) return null;
  
  // Formatar a data de resgate
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Para vouchers digitais, mostrar mais opções para acessar o código
  const isDigital = reward.reward_type === 'digital_service' || reward.reward_type === 'discount_coupon';
  
  return (
    <Card className="reward-confirmation">
      <div className="reward-confirmation__header">
        <div className="reward-confirmation__title">
          <h3>{t('rewards.confirmation.title')}</h3>
          <Icon name="check-circle" size={24} color="success" className="ms-2" />
        </div>
        <p className="reward-confirmation__subtitle">
          {isDigital
            ? t('rewards.confirmation.digitalSubtitle')
            : t('rewards.confirmation.physicalSubtitle')}
        </p>
      </div>
      
      <Tabs active={activeTab} onChange={setActiveTab}>
        <TabPane id="details" title={t('rewards.confirmation.details')}>
          <div className="reward-confirmation__details">
            <div className="reward-confirmation__reward">
              <h4>{reward.name}</h4>
              <p>{reward.description}</p>
            </div>
            
            <div className="reward-confirmation__info">
              <div className="reward-confirmation__info-item">
                <span className="reward-confirmation__label">{t('rewards.confirmation.redemptionId')}</span>
                <span className="reward-confirmation__value">{redemption.id}</span>
              </div>
              
              <div className="reward-confirmation__info-item">
                <span className="reward-confirmation__label">{t('rewards.confirmation.date')}</span>
                <span className="reward-confirmation__value">{formatDate(redemption.redeemed_at)}</span>
              </div>
              
              <div className="reward-confirmation__info-item">
                <span className="reward-confirmation__label">{t('rewards.confirmation.status')}</span>
                <span className="reward-confirmation__value">
                  <Badge 
                    variant={
                      redemption.status === 'completed' 
                        ? 'success' 
                        : redemption.status === 'pending' 
                        ? 'warning' 
                        : 'danger'
                    }
                  >
                    {t(`rewards.status.${redemption.status}`)}
                  </Badge>
                </span>
              </div>
              
              <div className="reward-confirmation__info-item">
                <span className="reward-confirmation__label">{t('rewards.confirmation.amacoinsCost')}</span>
                <span className="reward-confirmation__value">{redemption.amacoins_spent}</span>
              </div>
            </div>
            
            {isDigital && redemption.code && (
              <div className="reward-confirmation__code">
                <h4>{t('rewards.confirmation.yourCode')}</h4>
                <div className="reward-confirmation__code-container">
                  <div className="reward-confirmation__code-value">
                    {redemption.code}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleCopyCode}
                    className="reward-confirmation__copy-button"
                  >
                    <FaCopy />
                    {copied ? t('common.copied') : t('common.copy')}
                  </Button>
                </div>
              </div>
            )}
            
            {redemption.instructions && (
              <div className="reward-confirmation__instructions">
                <h4>{t('rewards.confirmation.instructions')}</h4>
                <div className="reward-confirmation__instructions-text">
                  {redemption.instructions.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}
            
            {!isDigital && (
              <Alert variant="info" className="reward-confirmation__physical-info">
                <Icon name="info-circle" size={16} className="me-2" />
                {t('rewards.confirmation.physicalInfo')}
              </Alert>
            )}
          </div>
        </TabPane>
        
        {isDigital && redemption.code && (
          <TabPane id="qrcode" title={t('rewards.confirmation.qrCode')}>
            <div className="reward-confirmation__qrcode">
              <QRCode 
                value={redemption.code} 
                size={200}
                className="reward-confirmation__qrcode-image"
              />
              <p className="reward-confirmation__qrcode-help">
                {t('rewards.confirmation.qrCodeHelp')}
              </p>
            </div>
          </TabPane>
        )}
        
        {isDigital && redemption.code && (
          <TabPane id="barcode" title={t('rewards.confirmation.barcode')}>
            <div className="reward-confirmation__barcode">
              <Barcode
                value={redemption.code}
                format="CODE128"
                width={2}
                height={100}
                displayValue={true}
                className="reward-confirmation__barcode-image"
              />
              <p className="reward-confirmation__barcode-help">
                {t('rewards.confirmation.barcodeHelp')}
              </p>
            </div>
          </TabPane>
        )}
      </Tabs>
      
      <div className="reward-confirmation__actions">
        {isDigital && (
          <>
            <Button variant="outline" onClick={handleDownload} className="me-2">
              <FaDownload className="me-1" />
              {t('rewards.confirmation.download')}
            </Button>
            
            <Button variant="outline" onClick={handleShare} className="me-2">
              <FaShare className="me-1" />
              {t('rewards.confirmation.share')}
            </Button>
          </>
        )}
        
        <Button variant="primary" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </Card>
  );
};

RewardConfirmation.propTypes = {
  redemption: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    code: PropTypes.string,
    status: PropTypes.string.isRequired,
    redeemed_at: PropTypes.string.isRequired,
    amacoins_spent: PropTypes.number.isRequired,
    instructions: PropTypes.string
  }).isRequired,
  reward: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    reward_type: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onDownload: PropTypes.func,
  onShare: PropTypes.func
};

export default RewardConfirmation;