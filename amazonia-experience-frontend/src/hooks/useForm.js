import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para gerenciar formulários React
 * Fornece validação, manipulação de erros e submissão
 * 
 * @param {Object} initialValues - Valores iniciais dos campos do formulário
 * @param {function} onSubmit - Função chamada na submissão válida do formulário
 * @param {function} validate - Função que recebe valores e retorna erros
 * @returns {Object} Objeto com valores, erros, handlers e métodos de submissão
 */
const useForm = (initialValues = {}, onSubmit = () => {}, validate = () => ({})) => {
  const { t } = useTranslation();
  
  // Estado para valores e erros do formulário
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Valida o formulário e retorna se é válido
  const validateForm = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  // Handler para mudança em campos do formulário
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Determina o valor com base no tipo do campo
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Limpa o erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handler para mudança de valor direto (sem evento)
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpa o erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handler para quando um campo perde o foco
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Valida apenas o campo que perdeu o foco
    const fieldErrors = validate({
      ...values
    });
    
    if (fieldErrors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    }
  }, [values, validate]);

  // Reseta o formulário para os valores iniciais
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Handler para submissão do formulário
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    setIsSubmitted(true);
    
    // Marca todos os campos como tocados para mostrar todos os erros
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Valida o formulário
    const isValid = validateForm();
    
    if (!isValid) {
      setIsSubmitting(false);
      // Mostra mensagem de erro
      toast.error(t('forms.validationError'));
      return;
    }
    
    try {
      // Chama a função de submissão
      await onSubmit(values);
    } catch (error) {
      console.error('Erro na submissão do formulário:', error);
      // Se o erro tiver um campo específico, adiciona ao objeto de erros
      if (error.field) {
        setErrors(prev => ({
          ...prev,
          [error.field]: error.message || t('forms.fieldError')
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, t]);

  // Retorna todos os estados e handlers necessários
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    resetForm,
    validateForm
  };
};

export default useForm;