import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  MapPinIcon, 
  ClockIcon, 
  WifiIcon, 
  ShareIcon,
  CheckIcon,
  QrCodeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { Container, PageHeader, Section } from '../components/layout';
import { Button, Badge } from '../components/common';
import { EventCard } from '../components/cards';
import PlaceMap from '../components/places/PlaceMap';
import Modal from '../components/common/Modal';
import QRCode from '../components/common/QRCode';
import { api } from '../services/api';
import { checkInPlace } from '../redux/places/placesSlice';
import PlaceDetailSkeleton from '../components/skeletons/PlaceDetailSkeleton';

const PlaceDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [place, setPlace] = useState(null);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      setLoading(true);
      try {
        // Buscar detalhes do local
        const placeData = await api.places.getPlace(id);
        setPlace(placeData.place);

        // Buscar eventos próximos se tivermos coordenadas
        if (placeData.place.latitude && placeData.place.longitude) {
          const eventsData = await api.events.getNearbyEvents(
            placeData.place.latitude,
            placeData.place.longitude,
            1, // 1km radius
            { page: 1, limit: 4 }
          );
          setNearbyEvents(eventsData.events || []);
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
        toast.error(t('places.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [id, t]);

  // Manipular check-in no local
  const handleCheckIn = async () => {
    if (!isAuthenticated) {
      toast.info(t('places.loginToCheckIn'));
      return;
    }

    try {
      setCheckingIn(true);
      const resultAction = await dispatch(checkInPlace(place.id));
      
      if (checkInPlace.fulfilled.match(resultAction)) {
        const { verification_code } = resultAction.payload;
        setCheckInCode(verification_code);
        setShowQRModal(true);
        toast.success(t('places.checkInSuccess'));
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error(t('places.checkInError'));
    } finally {
      setCheckingIn(false);
    }
  };

  // Compartilhar local
  const sharePlace = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: place.description,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback para copiar link para o clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('common.linkCopied'));
    }
  };

  if (loading) {
    return <PlaceDetailSkeleton />;
  }

  if (!place) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('places.notFound')}</h2>
          <p className="text-gray-600 mb-6">{t('places.cantFind')}</p>
          <Link to="/places">
            <Button>{t('places.backToPlaces')}</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={place.name}
        description={place.address}
        showBackButton
        backTo="/places"
        backgroundImage={place.image_url}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={sharePlace}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ShareIcon className="h-5 w-5 mr-1" />
              {t('common.share')}
            </Button>
            
            <Button
              onClick={handleCheckIn}
              loading={checkingIn}
              disabled={checkingIn}
              className="bg-amazon-green-600 hover:bg-amazon-green-700"
            >
              <CheckIcon className="h-5 w-5 mr-1" />
              {t('places.checkIn')}
            </Button>
          </div>
        }
      />
      
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Detalhes principais */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-6">
                {/* Badges */}
                <div className="flex mb-4">
                  <Badge color="green">{place.type}</Badge>
                  
                  {place.wifi_available && (
                    <Badge color="blue" className="ml-2">
                      <WifiIcon className="h-3 w-3 mr-1" /> 
                      {t('places.wifiAvailable')}
                    </Badge>
                  )}
                </div>
                
                {/* Descrição */}
                <div className="prose max-w-none mb-6">
                  <p>{place.description}</p>
                </div>
                
                {/* Informações do local */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <MapPinIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('places.address')}</h3>
                      <p className="text-sm text-gray-600">{place.address}</p>
                    </div>
                  </div>
                  
                  {place.opening_hours && (
                    <div className="flex items-start">
                      <ClockIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{t('places.openingHours')}</h3>
                        <p className="text-sm text-gray-600">{place.opening_hours}</p>
                      </div>
                    </div>
                  )}
                  
                  {place.price_range && (
                    <div className="flex items-start">
                      <CurrencyDollarIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{t('places.priceRange')}</h3>
                        <p className="text-sm text-gray-600">{place.price_range}</p>
                      </div>
                    </div>
                  )}
                  
                  {place.contact_phone && (
                    <div className="flex items-start">
                      <div className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{t('places.phone')}</h3>
                        <p className="text-sm text-gray-600">{place.contact_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Link para website se disponível */}
                {place.website && (
                  <div className="mt-6">
                    <a 
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-amazon-river-600 hover:bg-amazon-river-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      {t('places.visitWebsite')}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Mapa do local */}
              {place.latitude && place.longitude && (
                <div className="h-64">
                  <PlaceMap 
                    places={[place]} 
                    center={{ lat: place.latitude, lng: place.longitude }} 
                    zoom={15}
                  />
                </div>
              )}
            </div>
            
            {/* Recompensa AmaCoins */}
            <div className="bg-gradient-to-r from-amazon-green-500 to-sustainable-green-500 rounded-lg shadow-lg p-6 text-white mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('places.earnAmacoins')}</h3>
              <p className="mb-4">{t('places.checkInToEarn')}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl font-bold">{place.amacoins_value}</span>
                  <span className="ml-2 font-medium">AmaCoins</span>
                </div>
                <Button
                  onClick={handleCheckIn}
                  loading={checkingIn}
                  disabled={checkingIn}
                  variant="white"
                >
                  {t('places.checkInNow')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Informações do parceiro */}
            {place.partner && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('places.partner')}</h3>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-amazon-earth-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amazon-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{place.partner.business_name}</p>
                    <p className="text-xs text-gray-600">{place.partner.business_type}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Eventos próximos */}
            {nearbyEvents.length > 0 && (
              <Section
                title={t('places.nearbyEvents')}
                description={t('places.eventsNearPlace')}
                className="bg-white rounded-lg shadow p-6 mb-6"
                contentClassName="mt-4 space-y-4"
              >
                {nearbyEvents.map(event => (
                  <EventCard key={event.id} event={event} compact />
                ))}
              </Section>
            )}
            
            {/* Box de ajuda */}
            <div className="bg-amazon-river-50 border border-amazon-river-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amazon-river-800 mb-2">{t('places.needHelp')}</h3>
              <p className="text-sm text-amazon-river-700 mb-4">{t('places.helpText')}</p>
              <Link to="/chat">
                <Button
                  variant="outline"
                  className="w-full border-amazon-river-300 text-amazon-river-700 hover:bg-amazon-river-100"
                >
                  {t('places.chatWithUs')}
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
        title={t('places.checkInCode')}
      >
        <div className="text-center p-4">
          <div className="mb-4">
            <QRCode value={checkInCode} size={200} />
          </div>
          <p className="text-sm text-gray-600 mb-2">{t('places.showQrToStaff')}</p>
          <div className="bg-gray-100 p-3 rounded-md flex items-center justify-center mb-4">
            <QrCodeIcon className="h-6 w-6 text-gray-500 mr-2" />
            <span className="text-lg font-mono font-bold tracking-wider">{checkInCode}</span>
          </div>
          <p className="text-xs text-gray-500">{t('places.checkInDisclaimer')}</p>
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

export default PlaceDetail;