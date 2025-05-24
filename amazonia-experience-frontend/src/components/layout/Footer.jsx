import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Logo from '../common/Logo';
import SocialLinks from '../common/SocialLinks';

/**
 * Componente de rodapé da aplicação
 */
const Footer = ({ className = '' }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  // Links para o rodapé
  const footerLinks = [
    {
      title: t('footer.navigation'),
      links: [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.events'), path: '/events' },
        { name: t('nav.places'), path: '/places' },
        { name: t('nav.rewards'), path: '/rewards' },
        { name: t('nav.quizzes'), path: '/quizzes' }
      ]
    },
    {
      title: t('footer.resources'),
      links: [
        { name: t('footer.connectivity'), path: '/connectivity' },
        { name: t('footer.emergency'), path: '/emergency' },
        { name: t('footer.chat'), path: '/chat' },
        { name: t('footer.faq'), path: '/faq' }
      ]
    },
    {
      title: t('footer.about'),
      links: [
        { name: t('footer.aboutApp'), path: '/about' },
        { name: t('footer.cop30'), href: 'https://cop30.gov.br', external: true },
        { name: t('footer.termsOfService'), path: '/terms' },
        { name: t('footer.privacyPolicy'), path: '/privacy' }
      ]
    }
  ];
  
  return (
    <footer className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center">
              <Logo className="h-10 w-auto" />
              <span className="ml-2 text-lg font-semibold text-amazon-green-700">
                AmazôniaExperience
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              {t('footer.description')}
            </p>
            
            {/* Redes sociais */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t('footer.followUs')}
              </h3>
              <SocialLinks />
            </div>
          </div>
          
          {/* Links de navegação */}
          {footerLinks.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-amazon-green-600"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-sm text-gray-600 hover:text-amazon-green-600"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Linha de copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} AmazôniaExperience. {t('footer.allRightsReserved')}
          </p>
          <p className="text-sm text-gray-500 mt-2 md:mt-0">
            {t('footer.madeWith')} ♥ {t('footer.forCOP30')}
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;