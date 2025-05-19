import { createSlice } from '@reduxjs/toolkit';

// Estado inicial
const initialState = {
  // Modal
  modal: {
    isOpen: false,
    type: null, // 'check-in', 'quiz-result', 'reward-redemption', etc.
    data: null,
    config: {
      closable: true,
      maskClosable: true,
      width: 'md', // 'sm', 'md', 'lg', 'xl', 'full'
      centered: true,
      fullscreen: false
    }
  },
  
  // Notificações
  notification: {
    visible: false,
    message: '',
    type: 'info', // 'info', 'success', 'warning', 'error'
    duration: 3000
  },
  
  // Drawer (painel lateral)
  drawer: {
    isOpen: false,
    type: null, // 'filter', 'profile', 'notification', etc.
    data: null,
    position: 'right', // 'left', 'right', 'top', 'bottom'
    width: 300, // em pixels
    height: '100%'
  },
  
  // Tema
  theme: {
    mode: 'light', // 'light', 'dark', 'system'
    primaryColor: 'amazon-green',
    fontSize: 'medium', // 'small', 'medium', 'large'
    highContrast: false
  },
  
  // Layout
  layout: {
    menuCollapsed: false,
    headerVisible: true,
    footerVisible: true,
    sidebarVisible: true
  },
  
  // Responsividade
  responsive: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1200
  }
};

// Slice de UI
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal
    openModal: (state, action) => {
      state.modal.isOpen = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data;
      state.modal.config = { ...state.modal.config, ...action.payload.config };
    },
    
    closeModal: (state) => {
      state.modal.isOpen = false;
    },
    
    updateModalData: (state, action) => {
      state.modal.data = { ...state.modal.data, ...action.payload };
    },
    
    // Notificações
    showNotification: (state, action) => {
      state.notification.visible = true;
      state.notification.message = action.payload.message;
      state.notification.type = action.payload.type || 'info';
      state.notification.duration = action.payload.duration || 3000;
    },
    
    hideNotification: (state) => {
      state.notification.visible = false;
    },
    
    // Drawer
    openDrawer: (state, action) => {
      state.drawer.isOpen = true;
      state.drawer.type = action.payload.type;
      state.drawer.data = action.payload.data;
      state.drawer.position = action.payload.position || state.drawer.position;
      state.drawer.width = action.payload.width || state.drawer.width;
      state.drawer.height = action.payload.height || state.drawer.height;
    },
    
    closeDrawer: (state) => {
      state.drawer.isOpen = false;
    },
    
    updateDrawerData: (state, action) => {
      state.drawer.data = { ...state.drawer.data, ...action.payload };
    },
    
    // Tema
    setTheme: (state, action) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    
    toggleThemeMode: (state) => {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light';
    },
    
    // Layout
    setLayout: (state, action) => {
      state.layout = { ...state.layout, ...action.payload };
    },
    
    toggleMenu: (state) => {
      state.layout.menuCollapsed = !state.layout.menuCollapsed;
    },
    
    // Responsividade
    setResponsive: (state, action) => {
      const { width } = action.payload;
      state.responsive.screenWidth = width;
      
      // Atualizar flags de responsividade
      state.responsive.isMobile = width < 768;
      state.responsive.isTablet = width >= 768 && width < 1024;
      state.responsive.isDesktop = width >= 1024;
      
      // Ajustar layout para dispositivos móveis
      if (state.responsive.isMobile && !state.layout.menuCollapsed) {
        state.layout.menuCollapsed = true;
      }
    },
    
    // Resetar estado
    resetUiState: () => initialState
  }
});

// Exportar ações e reducer
export const { 
  openModal, 
  closeModal, 
  updateModalData,
  showNotification,
  hideNotification,
  openDrawer,
  closeDrawer,
  updateDrawerData,
  setTheme,
  toggleThemeMode,
  setLayout,
  toggleMenu,
  setResponsive,
  resetUiState
} = uiSlice.actions;

export default uiSlice.reducer;