// Exportação dos componentes do usuário
export { default as UserProfile } from './UserProfile';
export { default as UserSettings } from './UserSettings';
export { default as UserVisits } from './UserVisits';
export { default as UserRedemptions } from './UserRedemptions';
export { default as UserQuizzes } from './UserQuizzes';
export { default as UserAmaCoins } from './UserAmaCoins';

// Exportação conveniente de todos os componentes
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';
import UserVisits from './UserVisits';
import UserRedemptions from './UserRedemptions';
import UserQuizzes from './UserQuizzes';
import UserAmaCoins from './UserAmaCoins';

export default {
  UserProfile,
  UserSettings,
  UserVisits,
  UserRedemptions,
  UserQuizzes,
  UserAmaCoins
};