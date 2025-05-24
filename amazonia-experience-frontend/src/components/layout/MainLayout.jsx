import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import Container from './Container';
import FloatingChat from '../chat/FloatingChat';

/**
 * Layout principal da aplicação que envolve todas as páginas
 * Inclui a barra de navegação, sidebar (em desktop), conteúdo principal
 * e navegação inferior (em mobile)
 */
const MainLayout = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Detectar se é dispositivo móvel
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fechar sidebar ao mudar de rota em dispositivos móveis
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  // Verificar se está na página inicial
  const isHomePage = location.pathname === '/';
  
  // Verificar se é uma página de autenticação
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  
  // Se for página de autenticação, não exibir layout completo
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sustainable-green-100 to-amazon-river-50">
        <div className="max-w-md mx-auto p-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1">
        {/* Sidebar (visível apenas em desktop ou quando aberta em mobile) */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <Container fullWidth={isHomePage}>
            {children}
          </Container>
        </main>
      </div>
      
      {/* Rodapé (visível apenas em desktop) */}
      <Footer className="hidden md:block" />
      
      {/* Navegação inferior (visível apenas em mobile) */}
      {isMobile && <BottomNavigation />}
      
      {/* Chat flutuante (visível apenas quando autenticado) */}
      {isAuthenticated && <FloatingChat />}
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;