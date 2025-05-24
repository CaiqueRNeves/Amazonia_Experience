import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon, 
  ShareIcon,
  CheckIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { Container, PageHeader, Section } from '../components/layout';
import { Button, Badge } from '../components/common';
import { PlaceCard } from '../components/cards';
import EventMap from '../components/events/EventMap';
import Modal from '../components/common/Modal';
import QRCode from '../components/common/QRCode';
import { api } from '../services/api';
import { checkInEvent } from '../redux/events/eventsSlice';
import EventDetailSkeleton from '../components/skeletons/EventDetailSkeleton';

const EventDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [event, setEvent] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        // Buscar detalhes do evento
        const eventData = await api.events.getEventById(id);
        setEvent(eventData);

        // Buscar locais próximos do evento
        
        if (eventData.latitude && eventData.longitude) {
          const placesData = await api.places.getNearbyPlaces(
            eventData.latitude,
            eventData.longitude,
            1, // 1km radius
            1, // página
            4  // limite
          );
          setNearbyPlaces(placesData.places || []);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error(t('events.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, t]);

  // Função para formatar data e hora do evento
  const formatEventTime = (startTime, endTime) => {
    if (!startTime) return '';

    const start = new Date(startTime);
    let formattedTime = format(start, 'dd/MM/yyyy HH:mm');

    if (endTime) {
      const end = new Date(endTime);
      // Se for no mesmo dia, mostrar só a hora do fim
      if (start.toDateString() === end.toDateString()) {
        formattedTime += ` - ${format(end, 'HH:mm')}`;
      } else {
        formattedTime += ` - ${format(end, 'dd/MM/yyyy HH:mm')}`;
      }
    }

    return formattedTime;
  };

  // Verificar se o evento já passou
  const isEventPassed = () => {
    if (!event || !event.end_time) return false;
    return new Date(event.end_time) < new Date();
  };

  // Verificar se o evento está acontecendo agora
  const isEventOngoing = () => {
    if (!event || !event.start_time || !event.end_time) return false;
    const now = new Date();
    return new Date(event.start_time) <= now && new Date(event.end_time) >= now;
  };

  // Manipular check-in no evento
  const handleCheckIn = async () => {
    if (!isAuthenticated) {
      toast.info(t('events.loginToCheckIn'));
      return;
    }

    if (isEventPassed()) {
      toast.error(t('events.eventAlreadyPassed'));
      return;
    }

    try {
      setCheckingIn(true);
      const resultAction = await dispatch(checkInEvent(event.id));
      
      if (checkInEvent.fulfilled.match(resultAction)) {
        const { verification_code } = resultAction.payload;
        setCheckInCode(verification_code);
        setShowQRModal(true);
        toast.success(t('events.checkInSuccess'));
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error(t('events.checkInError'));
    } finally {
      setCheckingIn(false);
    }
  };

  // Compartilhar evento
  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback para copiar link para o clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('common.linkCopied'));
    }
  };

  if (loading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('events.notFound')}</h2>
          <p className="text-gray-600 mb-6">{t('events.cantFind')}</p>
          <Link to="/events">
            <Button>{t('events.backToEvents')}</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={event.name}
        description={formatEventTime(event.start_time, event.end_time)}
        showBackButton
        backTo="/events"
        backgroundImage={event.image_url}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={shareEvent}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ShareIcon className="h-5 w-5 mr-1" />
              {t('common.share')}
            </Button>
            
            {!isEventPassed() && (
              <Button
                onClick={handleCheckIn}
                loading={checkingIn}
                disabled={checkingIn}
                className="bg-amazon-green-600 hover:bg-amazon-green-700"
              >
                <CheckIcon className="h-5 w-5 mr-1" />
                {t('events.checkIn')}
              </Button>
            )}
          </div>
        }
      />
      
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Detalhes principais */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                {/* Status do evento */}
                <div className="flex mb-4">
                  {isEventPassed() ? (
                    <Badge color="gray">{t('events.eventPassed')}</Badge>
                  ) : isEventOngoing() ? (
                    <Badge color="green">{t('events.happeningNow')}</Badge>
                  ) : (
                    <Badge color="blue">{t('events.upcoming')}</Badge>
                  )}
                  
                  {event.is_featured && (
                    <Badge color="yellow" className="ml-2">{t('events.featured')}</Badge>
                  )}
                  
                  <Badge color="purple" className="ml-2">{event.event_type}</Badge>
                </div>
                
                {/* Descrição */}
                <div className="prose max-w-none mb-6">
                  <p>{event.description}</p>
                </div>
                
                {/* Informações do evento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <CalendarIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('events.date')}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.start_time), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ClockIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('events.time')}</h3>
                      <p className="text-sm text-gray-600">
                        {`${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPinIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('events.location')}</h3>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <UserGroupIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('events.attendance')}</h3>
                      <p className="text-sm text-gray-600">
                        {event.current_attendance || 0} / {event.max_capacity ? event.max_capacity : '∞'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Link de registro externo se disponível */}
                {event.registration_link && (
                  <div className="mt-6">
                    <a 
                      href={event.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-amazon-river-600 hover:bg-amazon-river-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      {t('events.register')}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Mapa do evento */}
              {event.latitude && event.longitude && (
                <div className="h-64">
                  <EventMap 
                    events={[event]} 
                    center={{ lat: event.latitude, lng: event.longitude }} 
                    zoom={15}
                  />
                </div>
              )}
            </div>
            
            {/* Recompensa AmaCoins */}
            <div className="bg-gradient-to-r from-amazon-green-500 to-sustainable-green-500 rounded-lg shadow-lg p-6 text-white mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('events.earnAmacoins')}</h3>
              <p className="mb-4">{t('events.checkInToEarn')}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{event.amacoins_value}</span>
                  <span className="ml-2 font-medium">AmaCoins</span>
                </div>
                <Button
                  onClick={handleCheckIn}
                  loading={checkingIn}
                  disabled={isEventPassed() || checkingIn}
                  variant="white"
                >
                  {t('events.checkInNow')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Organizador */}
            {event.organizer && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('events.organizer')}</h3>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-amazon-green-100 flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-amazon-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
                    {event.organizer.description && (
                      <p className="text-sm text-gray-600">{event.organizer.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Locais próximos */}
            {nearbyPlaces.length > 0 && (
              <Section
                title={t('events.nearbyPlaces')}
                description={t('events.placesNearEvent')}
                className="bg-white rounded-lg shadow p-6 mb-6"
                contentClassName="mt-4 space-y-4"
              >
                {nearbyPlaces.map(place => (
                  <PlaceCard key={place.id} place={place} compact />
                ))}
              </Section>
            )}
            
            {/* Box de ajuda */}
            <div className="bg-amazon-river-50 border border-amazon-river-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amazon-river-800 mb-2">{t('events.needHelp')}</h3>
              <p className="text-sm text-amazon-river-700 mb-4">{t('events.helpText')}</p>
              <Link to="/chat">
                <Button
                  variant="outline"
                  className="w-full border-amazon-river-300 text-amazon-river-700 hover:bg-amazon-river-100"
                >
                  {t('events.chatWithUs')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Modal de QR Code para check-in */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={t('events.checkInCode')}
      >
        <div className="text-center p-4">
          <div className="mb-4">
            <QRCode value={checkInCode} size={200} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{t('events.showQrToStaff')}</p>
          <div className="bg-gray-100 p-3 rounded-md flex items-center justify-center mb-4">
            <QrCodeIcon className="h-6 w-6 text-gray-500 mr-2" />
            <span className="text-lg font-mono font-bold tracking-wider">{checkInCode}</span>
          </div>
          <p className="text-xs text-gray-500">{t('events.checkInDisclaimer')}</p>
          <Button
            onClick={() => setShowQRModal(false)}
            className="mt-4"
          >
            {t('common.close')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetail;