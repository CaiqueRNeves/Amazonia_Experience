import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks';

// Temas disponíveis
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Criação do contexto
export const ThemeContext = createContext(null);

/**
 * Provedor de tema da aplicação
 * Gerencia temas claros/escuros e preferências do usuário
 */
export const ThemeProvider = ({ children }) => {
  // Usar hook de localStorage para persistir a preferência de tema
  const [storedTheme, setStoredTheme] = useLocalStorage('amazonia_theme', THEMES.SYSTEM);
  
  // Estado local para o tema atual
  const [theme, setTheme] = useState(storedTheme);
  // Estado para rastrear se o tema atual é escuro
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Aplicar tema e detectar preferência do sistema quando montar
  useEffect(() => {
    // Aplicar tema inicial
    applyTheme(storedTheme);
    
    // Adicionar listener para mudanças na preferência do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Função para atualizar o tema quando a preferência do sistema mudar
    const handleChange = (e) => {
      if (theme === THEMES.SYSTEM) {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle('dark-mode', e.matches);
      }
    };
    
    // Verificar preferência inicial
    if (theme === THEMES.SYSTEM) {
      setIsDarkMode(mediaQuery.matches);
    }
    
    // Adicionar listener
    try {
      // Tenta usar o método moderno de addEventListener
      mediaQuery.addEventListener('change', handleChange);
    } catch (e) {
      // Fallback para o método antigo (para navegadores mais antigos)
      mediaQuery.addListener(handleChange);
    }
    
    // Limpar listener
    return () => {
      try {
        mediaQuery.removeEventListener('change', handleChange);
      } catch (e) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [storedTheme, theme]);

  /**
   * Aplica um tema ao documento
   * @param {string} newTheme - Tema a ser aplicado
   */
  const applyTheme = useCallback((newTheme) => {
    // Remover classes de tema anteriores
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    
    // Determinar se deve aplicar tema escuro
    let shouldApplyDarkMode = false;
    
    switch (newTheme) {
      case THEMES.DARK:
        shouldApplyDarkMode = true;
        break;
      case THEMES.LIGHT:
        shouldApplyDarkMode = false;
        break;
      case THEMES.SYSTEM:
      default:
        // Verificar preferência do sistema
        shouldApplyDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        break;
    }
    
    // Aplicar classe apropriada
    document.documentElement.classList.add(shouldApplyDarkMode ? 'dark-mode' : 'light-mode');
    
    // Atualizar estado
    setIsDarkMode(shouldApplyDarkMode);
  }, []);

  /**
   * Altera o tema da aplicação
   * @param {string} newTheme - Novo tema
   */
  const changeTheme = useCallback((newTheme) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error(`Tema inválido: ${newTheme}`);
      return;
    }
    
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  }, [applyTheme, setStoredTheme]);

  /**
   * Alterna entre tema claro e escuro
   */
  const toggleTheme = useCallback(() => {
    if (theme === THEMES.LIGHT) {
      changeTheme(THEMES.DARK);
    } else if (theme === THEMES.DARK) {
      changeTheme(THEMES.LIGHT);
    } else {
      // Se estiver usando tema do sistema, muda para o oposto do atual
      changeTheme(isDarkMode ? THEMES.LIGHT : THEMES.DARK);
    }
  }, [theme, isDarkMode, changeTheme]);

  // Valores expostos pelo contexto
  const value = {
    theme,
    isDarkMode,
    changeTheme,
    toggleTheme,
    THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar o contexto de tema
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
};

export default { ThemeContext, ThemeProvider, useTheme };