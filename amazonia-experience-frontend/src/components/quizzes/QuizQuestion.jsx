import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Componentes e ícones
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

/**
 * Componente que exibe uma pergunta individual do quiz
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.question - Dados da pergunta
 * @param {number} props.questionNumber - Número da pergunta atual
 * @param {number} props.totalQuestions - Número total de perguntas
 * @param {string} props.selectedAnswer - Resposta selecionada pelo usuário
 * @param {Function} props.onAnswer - Função chamada quando o usuário seleciona uma resposta
 */
const QuizQuestion = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  selectedAnswer, 
  onAnswer 
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  
  // Processar opções da pergunta
  useEffect(() => {
    if (!question) return;
    
    // Tipo de pergunta
    if (question.question_type === 'multiple_choice') {
      // Desserializar opções se necessário
      let questionOptions = question.options;
      if (typeof questionOptions === 'string') {
        try {
          questionOptions = JSON.parse(questionOptions);
        } catch (error) {
          console.error('Erro ao processar opções da pergunta:', error);
          questionOptions = [];
        }
      }
      
      setOptions(questionOptions || []);
    } else if (question.question_type === 'true_false') {
      setOptions([
        { id: 'true', text: t('common.true') },
        { id: 'false', text: t('common.false') }
      ]);
    }
  }, [question, t]);
  
  // Limpar feedback quando a pergunta mudar
  useEffect(() => {
    setFeedback(null);
  }, [question]);
  
  // Função para lidar com a seleção de resposta
  const handleSelectAnswer = (answer) => {
    if (selectedAnswer) return; // Evitar múltiplas seleções
    
    onAnswer(answer);
    
    // Mostrar feedback
    const isCorrect = answer === question.correct_answer;
    setFeedback({
      isCorrect,
      message: isCorrect 
        ? t('quiz.feedback.correct') 
        : t('quiz.feedback.incorrect')
    });
  };
  
  // Verificar se uma opção está selecionada
  const isOptionSelected = (optionId) => {
    return selectedAnswer === optionId;
  };
  
  // Obter classe de estilo para uma opção
  const getOptionClassName = (optionId) => {
    const baseClass = "p-4 rounded-lg border transition-colors duration-200 mb-3 flex items-start";
    
    if (!selectedAnswer) {
      return `${baseClass} border-gray-200 hover:border-green-500 cursor-pointer`;
    }
    
    // Se a resposta já foi selecionada
    if (isOptionSelected(optionId)) {
      return `${baseClass} border-2 ${
        feedback?.isCorrect 
          ? "border-green-500 bg-green-50" 
          : "border-red-500 bg-red-50"
      }`;
    }
    
    return `${baseClass} border-gray-200 opacity-70`;
  };
  
  // Obter ícone para feedback de uma opção
  const getOptionIcon = (optionId) => {
    if (!selectedAnswer) return null;
    
    if (isOptionSelected(optionId)) {
      return feedback?.isCorrect 
        ? <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0" /> 
        : <XCircle className="text-red-500 h-5 w-5 flex-shrink-0" />;
    }
    
    if (question.correct_answer === optionId && selectedAnswer) {
      return <CheckCircle className="text-green-500 h-5 w-5 flex-shrink-0" />;
    }
    
    return null;
  };
  
  // Renderizar mensagem caso não exista pergunta
  if (!question) {
    return (
      <div className="text-center p-6">
        <HelpCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium">{t('quiz.noQuestionAvailable')}</h3>
      </div>
    );
  }
  
  return (
    <div className="quiz-question">
      {/* Cabeçalho da pergunta */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          {t('quiz.questionCounter', { current: questionNumber, total: totalQuestions })}
        </div>
        <h2 className="text-xl font-bold">{question.question_text}</h2>
      </div>
      
      {/* Opções de resposta */}
      <div className="mb-6">
        {question.question_type === 'multiple_choice' || question.question_type === 'true_false' ? (
          // Opções de múltipla escolha ou verdadeiro/falso
          <div>
            {options.map((option) => (
              <div
                key={option.id || option}
                className={getOptionClassName(option.id || option)}
                onClick={() => !selectedAnswer && handleSelectAnswer(option.id || option)}
              >
                <div className="mr-3 mt-1">
                  {getOptionIcon(option.id || option) || (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1">
                  {option.text || option}
                </div>
              </div>
            ))}
          </div>
        ) : question.question_type === 'open_ended' ? (
          // Pergunta aberta (entrada de texto)
          <div>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
              placeholder={t('quiz.typeYourAnswer')}
              value={selectedAnswer || ''}
              onChange={(e) => !selectedAnswer && onAnswer(e.target.value)}
              disabled={!!selectedAnswer}
            />
            {selectedAnswer && (
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => handleSelectAnswer(selectedAnswer)}
              >
                {t('common.submit')}
              </button>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 p-4 rounded-lg ${
          feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {feedback.isCorrect ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;