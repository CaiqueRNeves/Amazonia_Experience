import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  WifiIcon, 
  MapPinIcon, 
  SignalIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

import { Container, PageHeader, Section } from '../components/layout';
import { Button, Tabs } from '../components/common';
import { FilterSidebar, SearchInput } from '../components/filters';
import { api } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import ConnectivityMap from '../components/connectivity/ConnectivityMap';
import ConnectivitySpotCard from '../components/connectivity/ConnectivitySpotCard';
import ConnectivityReportModal from '../components/connectivity/ConnectivityReportModal';

const viewModes = [
  { id: 'list', label: 'Lista' },
  { id: 'map', label: 'Mapa' },
];

const Connectivity = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { coordinates, getCurrentPosition } = useGeolocation();
  
  const [spots, setSpots] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    wifiSpeed: '',
    isFree: false,
    isVerified: false,
    nearby: true,
  });
  
  // Obter localização atual ao carregar a página
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);
  
  // Carregar pontos de conectividade com base na localização e filtros
  useEffect(() => {
    const fetchConnectivityData = async () => {
      setLoading(true);
      try {
        let spotsData;
        
        // Se temos coordenadas e o filtro nearby está ativo, buscar pontos próximos
        if (filters.nearby && coordinates.latitude && coordinates.longitude) {
          spotsData = await api.connectivity.getNearbySpots(
            coordinates.latitude,
            coordinates.longitude,
            5, // 5km radius
            1, // página
            20 // limite
          );
        } else {
          // Caso contrário, buscar todos os pontos
          const params = {
            search: filters.search,
            wifi_speed: filters.wifiSpeed,
            is_free: filters.isFree,
            is_verified: filters.isVerified,
            page: 1,
            limit: 20,
          };
          
          spotsData = await api.connectivity.getConnectivitySpots(params);
        }
        
        setSpots(spotsData.spots || []);
        
        // Buscar dados do mapa de calor
        const heatmapResponse = await api.connectivity.getHeatmap();
        setHeatmapData(heatmapResponse.heatmap || []);
      } catch (error) {
        console.error('Error fetching connectivity data:', error);
        toast.error(t('connectivity.errorLoading'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnectivityData();
  }, [coordinates.latitude, coordinates.longitude, filters, t]);
  
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
  };
  
  const handleReportIssue = (spot) => {
    if (!isAuthenticated) {
      toast.info(t('connectivity.loginToReport'));
      return;
    }
    
    setSelectedSpot(spot);
    setShowReportModal(true);
  };
  
  const handleSubmitReport = async (reportData) => {
    try {
      await api.connectivity.reportSpot(selectedSpot.id, reportData);
      toast.success(t('connectivity.reportSuccess'));
      setShowReportModal(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(t('connectivity.reportError'));
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('connectivity.title')} 
        description={t('connectivity.description')}
      />
      
      <Container>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {t('connectivity.wifiInfo')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <SearchInput
              value={filters.search}
              onChange={handleSearch}
              placeholder={t('connectivity.searchPlaceholder')}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center"
            >
              <FilterIcon className="h-5 w-5 mr-2" />
              {t('common.filter')}
            </Button>
            
            <Button
              variant="outline"
              onClick={getCurrentPosition}
              className="flex items-center"
              disabled={loading}
            >
              <MapPinIcon className="h-5 w-5 mr-2" />
              {t('connectivity.useMyLocation')}
            </Button>
            
            <Tabs
              tabs={viewModes.map(mode => ({ ...mode, label: t(`connectivity.${mode.id}`) }))}
              value={viewMode}
              onChange={setViewMode}
              small
            />
          </div>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          {/* Sidebar de filtros */}
          <FilterSidebar 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
            type="connectivity"
          />
          
          {/* Conteúdo principal */}
          <div className="w-full">
            {loading ? (
              <div className="bg-white p-8 rounded-lg text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-64 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                {viewMode === 'map' ? (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ConnectivityMap 
                      spots={spots}
                      heatmapData={heatmapData}
                      userLocation={coordinates}
                      onSpotClick={setSelectedSpot}
                      selectedSpot={selectedSpot}
                      onReportIssue={handleReportIssue}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spots.map((spot) => (
                      <ConnectivitySpotCard
                        key={spot.id}
                        spot={spot}
                        onReportIssue={() => handleReportIssue(spot)}
                      />
                    ))}
                    
                    {spots.length === 0 && (
                      <div className="col-span-full bg-white p-8 rounded-lg text-center">
                        <WifiIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('connectivity.noSpotsFound')}
                        </h3>
                        <p className="text-gray-600">
                          {t('connectivity.tryDifferentFilters')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Seção de informações sobre conectividade */}
        <Section
          title={t('connectivity.wifiTips')}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-sustainable-green-100 flex items-center justify-center mb-4">
                  <WifiIcon className="h-8 w-8 text-sustainable-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('connectivity.freeWifi')}</h3>
                <p className="text-gray-600">{t('connectivity.freeWifiDescription')}</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-amazon-river-100 flex items-center justify-center mb-4">
                  <SignalIcon className="h-8 w-8 text-amazon-river-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('connectivity.signalStrength')}</h3>
                <p className="text-gray-600">{t('connectivity.signalStrengthDescription')}</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-amazon-earth-100 flex items-center justify-center mb-4">
                  <MapPinIcon className="h-8 w-8 text-amazon-earth-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('connectivity.officialSpots')}</h3>
                <p className="text-gray-600">{t('connectivity.officialSpotsDescription')}</p>
              </div>
            </div>
          </div>
        </Section>
      </Container>
      
      {/* Modal para reportar problemas de conectividade */}
      <ConnectivityReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        spot={selectedSpot}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
};

export default Connectivity;