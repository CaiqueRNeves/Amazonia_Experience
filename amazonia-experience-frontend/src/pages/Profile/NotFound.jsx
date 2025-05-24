import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon } from '@heroicons/react/24/outline';

import { Container } from '../components/layout';
import Button from '../components/common/Button';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Container className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto w-48 h-48 bg-amazon-green-100 rounded-full flex items-center justify-center">
            <span className="text-amazon-green-600 text-7xl font-bold">404</span>
          </div>
          
          <h1 className="mt-6 text-3xl font-bold text-gray-900">{t('notFound.title')}</h1>
          <p className="mt-3 text-xl text-gray-600 max-w-2xl">{t('notFound.message')}</p>
          
          <div className="mt-8">
            <Link to="/">
              <Button size="lg" className="px-8">
                <HomeIcon className="h-5 w-5 mr-2" />
                {t('notFound.backHome')}
              </Button>
            </Link>
          </div>
          
          <div className="mt-12">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('notFound.helpfulLinks')}</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-amazon-green-600 hover:text-amazon-green-800">
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link to="/places" className="text-amazon-green-600 hover:text-amazon-green-800">
                  {t('nav.places')}
                </Link>
              </li>
              <li>
                <Link to="/connectivity" className="text-amazon-green-600 hover:text-amazon-green-800">
                  {t('nav.connectivity')}
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="text-amazon-green-600 hover:text-amazon-green-800">
                  {t('nav.emergency')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;