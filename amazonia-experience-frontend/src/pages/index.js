// Importar todas as páginas
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Events from './Events';
import EventDetail from './EventDetail';
import Places from './Places';
import PlaceDetail from './PlaceDetail';
import Rewards from './Rewards';
import RewardDetail from './RewardDetail';
import Quizzes from './Quizzes';
import QuizDetail from './QuizDetail';
import Connectivity from './Connectivity';
import Emergency from './Emergency';
import Chat from './Chat';
import Profile from './Profile';
import NotFound from './NotFound';

// Importar páginas do perfil
import { ProfileVisits } from './Profile';

// Exportar todas as páginas individualmente
export {
  Home,
  Login,
  Register,
  Events,
  EventDetail,
  Places,
  PlaceDetail,
  Rewards,
  RewardDetail,
  Quizzes,
  QuizDetail,
  Connectivity,
  Emergency,
  Chat,
  Profile,
  ProfileVisits,
  NotFound
};

// Exportação padrão da página inicial
export default Home;