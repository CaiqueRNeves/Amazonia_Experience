// Exportar componentes individuais
export { default as RewardCard } from './RewardCard';
export { default as RewardDetail } from './RewardDetail';
export { default as RewardList } from './RewardList';
export { default as RewardFilter } from './RewardFilter';
export { default as RewardRedemption } from './RewardRedemption';
export { default as RewardConfirmation } from './RewardConfirmation';
export { default as PartnerBadge } from './PartnerBadge';

// Exportar todos os componentes como objeto padrão
import RewardCard from './RewardCard';
import RewardDetail from './RewardDetail';
import RewardList from './RewardList';
import RewardFilter from './RewardFilter';
import RewardRedemption from './RewardRedemption';
import RewardConfirmation from './RewardConfirmation';
import PartnerBadge from './PartnerBadge';

export default {
  RewardCard,
  RewardDetail,
  RewardList,
  RewardFilter,
  RewardRedemption,
  RewardConfirmation,
  PartnerBadge
};