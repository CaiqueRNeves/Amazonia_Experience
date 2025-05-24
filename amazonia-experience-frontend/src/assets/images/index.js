// Exportação centralizada de assets

// Imagens
import logo from './images/logo.svg';
import logoLight from './images/logo-light.svg';
import heroBackground from './images/hero-background.jpg';
import amazonPattern from './images/amazon-pattern.svg';
import placeholderEvent from './images/placeholder-event.jpg';
import placeholderPlace from './images/placeholder-place.jpg';
import placeholderReward from './images/placeholder-reward.jpg';
import placeholderUser from './images/placeholder-user.jpg';
import mapMarker from './images/map-marker.svg';

// Ícones
import brazilFlag from './icons/brazil-flag.svg';
import cop30Icon from './icons/cop30-icon.svg';
import amacoinsIcon from './icons/amacoins-icon.svg';

// Estilos
import './styles/main.css';

// Exportação de imagens
export const images = {
  logo,
  logoLight,
  heroBackground,
  amazonPattern,
  placeholderEvent,
  placeholderPlace,
  placeholderReward,
  placeholderUser,
  mapMarker
};

// Exportação de ícones
export const icons = {
  brazilFlag,
  cop30Icon,
  amacoinsIcon
};

// Função para obter URL completa de um asset
export const getAssetUrl = (path) => {
  const baseUrl = process.env.PUBLIC_URL || '';
  return `${baseUrl}/assets/${path}`;
};

// Imagens de placeholder com tamanhos diferentes
export const placeholders = {
  event: {
    small: placeholderEvent,
    medium: placeholderEvent,
    large: placeholderEvent
  },
  place: {
    small: placeholderPlace,
    medium: placeholderPlace,
    large: placeholderPlace
  },
  reward: {
    small: placeholderReward,
    medium: placeholderReward,
    large: placeholderReward
  },
  user: placeholderUser
};

// Exportação padrão
export default {
  images,
  icons,
  getAssetUrl,
  placeholders
};