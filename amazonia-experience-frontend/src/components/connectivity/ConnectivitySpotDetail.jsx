import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  WifiIcon, 
  MapPinIcon, 
  CheckBadgeIcon,
  ClockIcon,
  StarIcon,
  XMarkIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

import connectivityService from '../../services/connectivityService';
import { openModal } from '../../redux/slices/uiSlice';
import { useLocation as useUserLocation } from '../../hooks/useLocation';
import { geoService } from '../../services';
import Loader from '../common/Loader';
import Button from '../common/Button';
import ConnectivityReportForm from './ConnectivityReportForm';
import ConnectivityMap from './ConnectivityMap';
import ErrorMessage from '../common/ErrorMessage';

const ConnectivitySpotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { userLocation } = useUserLocation();
  
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Carregar detalhes do ponto de conectividade
  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await connectivityService.getSpotById(id);
        setSpot(data);
        
        // Calcular distância se a localização do usuário estiver disponível
        if (userLocation && data.latitude && data.longitude) {
          const dist = geoService.calculateDistance(
            userLocation.latitude, 
            userLocation.longitude,
            data.latitude,
            data.longitude
          );
          setDistance(dist);
        }
      } catch (err) {
        setError(err.response?.data?.message || t('errors.genericError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpotDetails();
  }, [id, userLocation, t]);
  
  // Renderizar ícones de intensidade do WiFi
  const renderWifiStrength = (speed) => {
    switch (speed) {
      case 'fast':
        return (
          <div className="wifi-strength high">
            <WifiIcon className="icon" />
            <WifiIcon className="icon" />
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.fast')}</span>
          </div>
        );
      case 'medium':
        return (
          <div className="wifi-strength medium">
            <WifiIcon className="icon" />
            <WifiIcon className="icon" />
            <WifiIcon className="icon-empty" />
            <span>{t('connectivity.speeds.medium')}</span>
          </div>
        );
      case 'slow':
        return (
          <div className="wifi-strength low">
            <WifiIcon className="icon" />
            <WifiIcon className="icon-empty" />
            <WifiIcon className="icon-empty" />
            <span>{t('connectivity.speeds.slow')}</span>
          </div>
        );
      default:
        return (
          <div className="wifi-strength unknown">
            <WifiIcon className="icon" />
            <span>{t('connectivity.speeds.unknown')}</span>
          </div>
        );
    }
  };
  
  // Renderizar indicador de status de atividade
  const renderWorkingStatus = () => {
    if (spot.working_percentage === undefined) return null;
    
    const isWorking = spot.working_percentage > 80;
    
    return (
      <div className={`working-status ${isWorking ? 'active' : 'inactive'}`}>
        {isWorking ? (
          <CheckBadgeIcon className="icon" />
        ) : (
          <XMarkIcon className="icon" />
        )}
        <span>
          {isWorking 
            ? t('connectivity.activeWifi') 
            : t('connectivity.inactiveWifi')}
        </span>
      </div>
    );
  };
  
  // Renderizar avaliação do ponto de conectividade
  const renderRating = () => {
    if (!spot.avg_signal_strength) return null;
    
    // Converte avaliação de 0-10 para 0-5 estrelas
    const stars = Math.round(spot.avg_signal_strength / 2);
    
    return (
      <div className="spot-rating">
        {[...Array(5)].map((_, i) => (
          <StarIcon 
            key={i} 
            className={`icon ${i < stars ? 'filled' : 'empty'}`} 
          />
        ))}
        <span>({spot.avg_signal_strength.toFixed(1)})</span>
      </div>
    );
  };
  
  // Abrir modal para iniciar chat sobre este ponto
  const handleStartChat = () => {
    dispatch(openModal({
      type: 'chat',
      data: {
        contextType: 'connectivity',
        contextId: spot.id,
        initialMessage: `${t('connectivity.chatAbout')} ${spot.name}`
      },
      config: {
        width: 'md'
      }
    }));
  };
  
  // Abrir modal para visualizar estatísticas
  const handleViewStats = () => {
    dispatch(openModal({
      type: 'connectivity-stats',
      data: {
        spot
      },
      config: {
        width: 'lg'
      }
    }));
  };
  
  // Voltar para a lista de pontos de conectividade
  const handleBack = () => {
    navigate('/connectivity');
  };
  
  // Alternar formulário de relatório
  const toggleReportForm = () => {
    if (!isAuthenticated) {
      // Se não estiver autenticado, redirecionar para login
      dispatch(openModal({
        type: 'login-required',
        data: {
          message: t('auth.loginToReport'),
          redirectTo: `/connectivity/${id}`
        }
      }));
      return;
    }
    
    setShowReportForm(!showReportForm);
  };
  
  // Lidar com o envio do relatório
  const handleReportSubmit = async (reportData) => {
    try {
      await connectivityService.reportSpot(id, reportData);
      
      // Mostrar notificação de sucesso
      dispatch(openModal({
        type: 'success',
        data: {
          title: t('connectivity.reportSuccess'),
          message: t('connectivity.reportThankYou')
        }
      }));
      
      // Esconder formulário
      setShowReportForm(false);
      
      // Recarregar dados do ponto
      const updatedSpot = await connectivityService.getSpotById(id);
      setSpot(updatedSpot);
    } catch (err) {
      dispatch(openModal({
        type: 'error',
        data: {
          title: t('connectivity.reportError'),
          message: err.response?.data?.message || t('errors.genericError')
        }
      }));
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!spot) {
    return <ErrorMessage message={t('connectivity.spotNotFound')} />;
  }

  return (
    <div className="connectivity-spot-detail">
      <div className="spot-header">
        <Button 
          variant="text" 
          icon={<ArrowLeftIcon className="icon" />}
          onClick={handleBack}
        >
          {t('common.back')}
        </Button>
        
        <h1 className="spot-name">{spot.name}</h1>
        
        {spot.is_verified && (
          <div className="verified-badge">
            <CheckBadgeIcon className="icon" />
            <span>{t('connectivity.verified')}</span>
          </div>
        )}
      </div>
      
      <div className="spot-content">
        <div className="spot-info-container">
          <div className="spot-main-info">
            <div className="spot-address">
              <MapPinIcon className="icon" />
              <span>{spot.address}</span>
            </div>
            
            <div className="spot-details">
              <div className="detail-item">
                <div className="detail-label">{t('connectivity.wifiSpeed')}</div>
                <div className="detail-value">
                  {renderWifiStrength(spot.wifi_speed)}
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">{t('connectivity.price')}</div>
                <div className="detail-value">
                  {spot.is_free ? (
                    <span className="free">{t('connectivity.free')}</span>
                  ) : (
                    <span className="paid">{t('connectivity.paid')}</span>
                  )}
                </div>
              </div>
              
              {spot.opening_hours && (
                <div className="detail-item">
                  <div className="detail-label">{t('connectivity.openingHours')}</div>
                  <div className="detail-value">
                    <ClockIcon className="icon" />
                    <span>{spot.opening_hours}</span>
                  </div>
                </div>
              )}
              
              {spot.working_percentage !== undefined && (
                <div className="detail-item">
                  <div className="detail-label">{t('connectivity.workingStatus')}</div>
                  <div className="detail-value">
                    {renderWorkingStatus()}
                  </div>
                </div>
              )}
              
              {spot.avg_signal_strength && (
                <div className="detail-item">
                  <div className="detail-label">{t('connectivity.userRating')}</div>
                  <div className="detail-value">
                    {renderRating()}
                  </div>
                </div>
              )}
              
              {distance !== null && (
                <div className="detail-item">
                  <div className="detail-label">{t('connectivity.distance')}</div>
                  <div className="detail-value">
                    <MapPinIcon className="icon" />
                    <span>
                      {distance < 1 
                        ? `${Math.round(distance * 1000)}m` 
                        : `${distance.toFixed(1)}km`}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {spot.description && (
              <div className="spot-description">
                <h3>{t('connectivity.description')}</h3>
                <p>{spot.description}</p>
              </div>
            )}
            
            <div className="spot-actions">
              <Button
                variant="primary"
                icon={<ChatBubbleLeftIcon className="icon" />}
                onClick={handleStartChat}
              >
                {t('connectivity.chatAbout')}
              </Button>
              
              <Button
                variant="primary"
                icon={<ChartBarIcon className="icon" />}
                onClick={handleViewStats}
              >
                {t('connectivity.viewStats')}
              </Button>
              
              <Button
                variant="primary"
                icon={<UserGroupIcon className="icon" />}
                onClick={toggleReportForm}
              >
                {showReportForm ? t('common.cancel') : t('connectivity.reportInfo')}
              </Button>
              
              <a 
                href={`https://maps.google.com/maps?daddr=${spot.latitude},${spot.longitude}`} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="btn btn-secondary"
             >
               <MapPinIcon className="icon" />
               {t('connectivity.directions')}
             </a>
           </div>
           
           {showReportForm && (
             <div className="report-form-container">
               <h3>{t('connectivity.reportForm')}</h3>
               <ConnectivityReportForm 
                 spotId={spot.id} 
                 onSubmit={handleReportSubmit}
                 onCancel={() => setShowReportForm(false)}
               />
             </div>
           )}
         </div>
         
         <div className="spot-map-container">
           <h3>{t('connectivity.spotLocation')}</h3>
           <ConnectivityMap 
             spots={[spot]} 
             userLocation={userLocation}
           />
         </div>
       </div>
     </div>
   </div>
 );
};

export default ConnectivitySpotDetail;