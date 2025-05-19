import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  TagIcon,
  UserGroupIcon,
  ShareIcon,
  ArrowLeftIcon,
  QrCodeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de } from 'date-fns/locale';

import { fetchEventById, checkInEvent } from '../../redux/slices/eventSlice';
import Loader from '../common/Loader';
import Map from '../common/Map';
import Modal from '../common/Modal';
import { useLocation } from '../../hooks/useLocation';
import { useToast } from '../../hooks/useToast';
import { analyticsService, geoService } from '../../services';

const EventDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const { currentEvent, loading, error, checkInSuccess, checkInError } = useSelector((state) => state.events);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState('idle'); // idle, success, error, verifying
  const [verification, setVerification] = useState(null);
  
  const { userLocation, locationError, isLocating } = useLocation();
  
  // Mapeamento de locales para date-fns
  const locales = {
    'pt-BR': ptBR,
    'en-US': enUS,
    'es-ES': es,
    'fr-FR': fr,
    'de-DE': de
  };
  
  // Obter o locale atual
  const currentLocale = locales[i18n.language] || enUS;

  useEffect(() => {
    // Carregar detalhes do evento ao montar o componente
    dispatch(fetchEventById(id));
    
    // Registro de analytics
    analyticsService.trackEvent(
      analyticsService.events.CONTENT_VIEW,
      { content_type: 'event', event_id: id },
      analyticsService.categories.ENGAGEMENT
    );
  }, [dispatch, id]);
  
  // Monitorar resultado de check-in
  useEffect(() => {
    if (checkInSuccess) {
      setCheckInStatus('success');
      setVerification(checkInSuccess);
      
      // Registro de analytics para check-in bem-sucedido
      analyticsService.trackCheckIn('event', id, currentEvent?.name);
    }
    
    if (checkInError) {
      setCheckInStatus('error');
    }
  }, [checkInSuccess, checkInError, id, currentEvent]);

  // Formatar data e hora do evento
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: currentLocale });
  };
  
  // Formatar horário
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Verificar se o evento está acontecendo agora
  const isHappeningNow = () => {
    if (!currentEvent) return false;
    
    const now = new Date();
    const startTime = new Date(currentEvent.start_time);
    const endTime = new Date(currentEvent.end_time);
    
    return now >= startTime && now <= endTime;
  };
  
  // Traduzir tipo de evento
  const translateEventType = (type) => {
    return t(`events.types.${type}`);
  };
  
  // Verificar se o usuário está no local do evento
  const checkUserAtEventLocation = () => {
    if (!userLocation || !currentEvent) return false;
    
    const eventLocation = {
      latitude: currentEvent.latitude,
      longitude: currentEvent.longitude
    };
    
    // Verificar se está a pelo menos 500 metros do local do evento
    return geoService.isNearby(userLocation, eventLocation, 500);
  };
  
  // Iniciar processo de check-in
  const handleCheckIn = () => {
    if (!isAuthenticated) {
      // Redirecionar para login com retorno para esta página
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    
    setShowCheckInModal(true);
    setCheckInStatus('verifying');
    
    // Primeiro verificamos se o usuário está no local
    if (checkUserAtEventLocation()) {
      // Se estiver no local, realizar check-in
      dispatch(checkInEvent(id));
    } else {
      // Se não estiver no local, mostrar erro
      setCheckInStatus('error');
      showToast(t('events.checkInLocationError'), 'error');
    }
  };
  
  // Compartilhar evento
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentEvent.name,
          text: currentEvent.description,
          url: window.location.href
        });
      } else {
        // Fallback: copiar link para clipboard
        await navigator.clipboard.writeText(window.location.href);
        showToast(t('common.linkCopied'), 'success');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };
  
  // Calcular capacidade disponível
  const getCapacityInfo = () => {
    if (!currentEvent) return null;
    
    if (!currentEvent.max_capacity) {
      return { 
        hasLimit: false 
      };
    }
    
    const available = Math.max(0, currentEvent.max_capacity - currentEvent.current_attendance);
    const isFull = currentEvent.current_attendance >= currentEvent.max_capacity;
    const percentage = Math.round((currentEvent.current_attendance / currentEvent.max_capacity) * 100);
    
    return {
      hasLimit: true,
      available,
      total: currentEvent.max_capacity,
      isFull,
      percentage,
      current: currentEvent.current_attendance
    };
  };
  
  const capacityInfo = getCapacityInfo();

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>{t('events.detailLoadError')}</h3>
        <p>{error}</p>
        <button 
          onClick={() => dispatch(fetchEventById(id))}
          className="btn btn-primary"
        >
          {t('common.tryAgain')}
        </button>
        
        <button 
          onClick={() => navigate('/events')}
          className="btn btn-outline"
        >
          <ArrowLeftIcon className="icon" />
          {t('events.backToList')}
        </button>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="not-found-container">
        <h3>{t('events.notFound')}</h3>
        <button 
          onClick={() => navigate('/events')}
          className="btn btn-primary"
        >
          <ArrowLeftIcon className="icon" />
          {t('events.backToList')}
        </button>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button 
          onClick={() => navigate('/events')}
          className="btn btn-icon"
          aria-label={t('common.back')}
        >
          <ArrowLeftIcon className="icon" />
        </button>
        
        <h1>{currentEvent.name}</h1>
        
        <button 
          onClick={handleShare}
          className="btn btn-icon"
          aria-label={t('common.share')}
        >
          <ShareIcon className="icon" />
        </button>
      </div>
      
      <div className="event-detail-image">
        <img 
          src={currentEvent.image_url || '/images/event-placeholder.jpg'} 
          alt={currentEvent.name} 
        />
        
        {isHappeningNow() && (
          <div className="happening-now-badge large">
            {t('events.happeningNow')}
          </div>
        )}
      </div>
      
      <div className="event-detail-content">
        <div className="event-detail-info">
          <div className="info-row">
            <div className="info-item">
              <CalendarIcon className="icon" />
              <div>
                <span className="label">{t('events.date')}</span>
                <span className="value">{formatEventDate(currentEvent.start_time)}</span>
              </div>
            </div>
            
            <div className="info-item">
              <ClockIcon className="icon" />
              <div>
                <span className="label">{t('events.time')}</span>
                <span className="value">{formatTime(currentEvent.start_time)} - {formatTime(currentEvent.end_time)}</span>
              </div>
            </div>
          </div>
          
          <div className="info-row">
            <div className="info-item">
              <MapPinIcon className="icon" />
              <div>
                <span className="label">{t('events.location')}</span>
                <span className="value">{currentEvent.location}</span>
              </div>
            </div>
            
            <div className="info-item">
              <TagIcon className="icon" />
              <div>
                <span className="label">{t('events.type')}</span>
                <span className="value">{translateEventType(currentEvent.event_type)}</span>
              </div>
            </div>
          </div>
          
          {capacityInfo.hasLimit && (
            <div className="capacity-container">
              <div className="capacity-header">
                <UserGroupIcon className="icon" />
                <span className="label">{t('events.capacity')}</span>
              </div>
              
              <div className="capacity-bar-container">
                <div 
                  className="capacity-bar" 
                  style={{ width: `${capacityInfo.percentage}%` }}
                />
              </div>
              
              <div className="capacity-text">
                {capacityInfo.isFull ? (
                  <span className="capacity-full">{t('events.capacityFull')}</span>
                ) : (
                  <span>
                    {t('events.capacityDetail', { 
                      current: capacityInfo.current, 
                      total: capacityInfo.total,
                      available: capacityInfo.available 
                    })}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="amacoins-container">
            <img src="/images/amacoin-large.svg" alt="AmaCoins" />
            <div>
              <span className="label">{t('events.amacoinReward')}</span>
              <span className="value">{currentEvent.amacoins_value} {t('common.amacoins')}</span>
            </div>
          </div>
        </div>
        
        <div className="event-description">
          <h3>{t('events.description')}</h3>
          <p>{currentEvent.description}</p>
          
          {currentEvent.registration_link && (
            <div className="registration-link">
              <h4>{t('events.registration')}</h4>
              <a 
                href={currentEvent.registration_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-primary"
              >
                {t('events.register')}
              </a>
            </div>
          )}
        </div>
        
        <div className="event-location-map">
          <h3>{t('events.map')}</h3>
          <Map 
            latitude={currentEvent.latitude} 
            longitude={currentEvent.longitude} 
            zoom={15}
            markers={[{
              latitude: currentEvent.latitude,
              longitude: currentEvent.longitude,
              title: currentEvent.name
            }]}
          />
        </div>
        
        <div className="event-actions">
          <button 
            onClick={handleCheckIn}
            className="btn btn-primary btn-lg"
            disabled={
              loading || 
              capacityInfo.isFull || 
              !isHappeningNow()
            }
          >
            {t('events.checkIn')}
          </button>
          
          {capacityInfo.isFull && (
            <p className="text-danger">{t('events.fullCapacityMessage')}</p>
          )}
          
          {!isHappeningNow() && (
            <p className="text-info">
              {new Date(currentEvent.start_time) > new Date() 
                ? t('events.notStartedYet')
                : t('events.alreadyEnded')}
            </p>
          )}
        </div>
      </div>
      
      {/* Modal de Check-in */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title={t('events.checkInProcess')}
      >
        <div className="check-in-modal">
          {checkInStatus === 'verifying' && (
            <div className="check-in-status">
              <Loader size="medium" />
              <p>{t('events.verifyingLocation')}</p>
            </div>
          )}
          
          {checkInStatus === 'error' && (
            <div className="check-in-status error">
              <div className="status-icon">
                <XMarkIcon className="icon" />
              </div>
              <h4>{t('events.checkInFailed')}</h4>
              <p>{checkInError || t('events.checkInLocationError')}</p>
              <button 
                onClick={() => setShowCheckInModal(false)}
                className="btn btn-primary"
              >
                {t('common.close')}
              </button>
            </div>
          )}
          
          {checkInStatus === 'success' && verification && (
            <div className="check-in-status success">
              <div className="status-icon">
                <CheckIcon className="icon" />
              </div>
              <h4>{t('events.checkInSuccess')}</h4>
              <div className="verification-code">
                <QrCodeIcon className="icon" />
                <span>{verification.verification_code}</span>
              </div>
              <p>{t('events.verificationCodeInfo')}</p>
              <div className="amacoins-earned">
                <img src="/images/amacoin.svg" alt="AmaCoins" />
                <p>
                  {t('events.amacoinsEarned', { 
                    amount: verification.amacoins_earned
                  })}
                </p>
              </div>
              <button 
                onClick={() => setShowCheckInModal(false)}
                className="btn btn-primary"
              >
                {t('common.close')}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventDetail;