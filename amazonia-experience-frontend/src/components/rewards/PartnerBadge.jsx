import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Tooltip } from '../ui';
import { FaHandshake, FaStore } from 'react-icons/fa';

/**
 * Componente para exibir distintivo de parceiro
 */
const PartnerBadge = ({ partner, showLink = false, className = '' }) => {
  const { t } = useTranslation();
  
  if (!partner) return null;
  
  const content = (
    <div className="partner-badge__content">
      <FaStore className="partner-badge__icon" />
      <span className="partner-badge__name">{partner.name}</span>
    </div>
  );
  
  if (showLink && partner.id) {
    return (
      <div className={`partner-badge ${className}`}>
        <Tooltip content={t('rewards.partnerTooltip')} className="partner-badge__tooltip">
          <Badge variant="primary" className="partner-badge__badge">
            <Link 
              to={`/partners/${partner.id}`} 
              className="partner-badge__link"
            >
              {content}
            </Link>
          </Badge>
        </Tooltip>
      </div>
    );
  }
  
  return (
    <div className={`partner-badge ${className}`}>
      <Tooltip content={t('rewards.partnerTooltip')} className="partner-badge__tooltip">
        <Badge variant="primary" className="partner-badge__badge">
          {content}
        </Badge>
      </Tooltip>
    </div>
  );
};

PartnerBadge.propTypes = {
  partner: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string.isRequired
  }).isRequired,
  showLink: PropTypes.bool,
  className: PropTypes.string
};

export default PartnerBadge;