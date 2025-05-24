import React from 'react';
import PropTypes from 'prop-types';

// Ícones
import { User } from 'lucide-react';

/**
 * Componente de avatar do usuário
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.user - Dados do usuário
 * @param {string} props.size - Tamanho do avatar: 'xs', 'sm', 'md', 'lg'
 * @param {string} props.className - Classes adicionais
 * @param {boolean} props.highlight - Se deve aplicar destaque ao avatar
 */
const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  highlight = false 
}) => {
  // Determinar tamanho do avatar
  const getAvatarSize = () => {
    switch (size) {
      case 'xs':
        return 'h-6 w-6 text-xs';
      case 'sm':
        return 'h-8 w-8 text-xs';
      case 'lg':
        return 'h-14 w-14 text-lg';
      case 'md':
      default:
        return 'h-10 w-10 text-sm';
    }
  };
  
  // Obter iniciais do nome do usuário
  const getInitials = () => {
    if (!user || !user.name) return '?';
    
    const nameParts = user.name.split(' ');
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };
  
  // Gerar cor de fundo baseada no nome do usuário
  const getBackgroundColor = () => {
    if (!user || !user.name) return 'bg-gray-400';
    
    // Lista de cores para avatares
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500'
    ];
    
    // Usar o nome como seed para escolher a cor
    const hash = user.name.split('').reduce(
      (acc, char) => acc + char.charCodeAt(0), 0
    );
    
    return colors[hash % colors.length];
  };
  
  // Determinar classes do avatar
  const avatarClasses = `
    ${getAvatarSize()} 
    ${getBackgroundColor()} 
    flex items-center justify-center 
    text-white font-medium rounded-full
    ${highlight ? 'ring-2 ring-offset-2 ring-yellow-500' : ''}
    ${className}
  `;
  
  return (
    <>
      {user && user.avatar_url ? (
        // Avatar com imagem
        <img
          src={user.avatar_url}
          alt={`Avatar de ${user.name}`}
          className={`${getAvatarSize()} rounded-full object-cover ${highlight ? 'ring-2 ring-offset-2 ring-yellow-500' : ''} ${className}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : (
        // Avatar com iniciais
        <div className={avatarClasses}>
          {getInitials()}
        </div>
      )}
    </>
  );
};

UserAvatar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar_url: PropTypes.string
  }),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
  highlight: PropTypes.bool
};

export default UserAvatar;