import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { ProfileLayout } from '../components/layout';
import { EmptyState, Badge } from '../components/common';
import { api } from '../services/api';
import Pagination from '../components/common/Pagination';

const ProfileVisits = () => {
  const { t } = useTranslation();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  
  useEffect(() => {
    fetchVisits();
  }, [pagination.currentPage]);
  
  const fetchVisits = async () => {
    setLoading(true);
    try {
      const response = await api.users.getVisits({ page: pagination.currentPage });
      setVisits(response.visits || []);
      setPagination({
        currentPage: parseInt(response.pagination?.page || '1'),
        totalPages: Math.ceil(
          parseInt(response.pagination?.total || '0') / parseInt(response.pagination?.limit || '10')
        ),
        totalItems: parseInt(response.pagination?.total || '0'),
      });
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };
  
  return (
    <ProfileLayout title={t('profile.visitsTitle')}>
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : visits.length === 0 ? (
        <EmptyState
          title={t('profile.noVisitsTitle')}
          description={t('profile.noVisitsDescription')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          ctaText={t('profile.exploreEvents')}
          ctaLink="/events"
        />
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('profile.yourVisits')}</h2>
            <p className="text-gray-600">{t('profile.visitsDescription')}</p>
          </div>
          
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {visit.place_name || visit.event_name}
                  </h3>
                  <Badge
                    color={visit.status === 'verified' ? 'green' : visit.status === 'rejected' ? 'red' : 'yellow'}
                  >
                    {visit.status === 'verified'
                      ? t('profile.verified')
                      : visit.status === 'rejected'
                        ? t('profile.rejected')
                        : t('profile.pending')}
                  </Badge>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">                  
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">
                    {format(new Date(visit.visited_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amazon-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-amazon-green-600">
                      +{visit.amacoins_earned} AmaCoins
                    </span>
                  </div>
                  
                  <div>
                    {visit.place_name ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amazon-earth-100 text-amazon-earth-800">
                        {t('profile.place')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amazon-river-100 text-amazon-river-800">
                        {t('profile.event')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </ProfileLayout>
  );
};

export default ProfileVisits;