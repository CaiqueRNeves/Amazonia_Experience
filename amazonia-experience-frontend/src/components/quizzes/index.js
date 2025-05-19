/**
 * Exporta todos os componentes da pasta quizzes
 * para facilitar a importação em outros arquivos
 */

import QuizList from './QuizList';
import QuizDetail from './QuizDetail';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import QuizCard from './QuizCard';
import Leaderboard from './Leaderboard';
import QuizAttemptHistory from './QuizAttemptHistory';
import QuizProgress from './QuizProgress';
import QuizTimer from './QuizTimer';

export {
  QuizList,
  QuizDetail,
  QuizQuestion,
  QuizResults,
  QuizCard,
  Leaderboard,
  QuizAttemptHistory,
  QuizProgress,
  QuizTimer
};

// Exportação padrão do componente principal
export default QuizList;