import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  GiftIcon, 
  ShoppingBagIcon,
  ClockIcon,
  ShareIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

import { Container, PageHeader } from '../components/layout';
import { Button, Badge } from '../components/common';
import Modal from '../components/common/Modal';
import QRCode from '../components/common/QRCode';
import { api } from '../services/api';
import { redeemReward } from '../redux/rewards/rewardsSlice';
import RewardDetailSkeleton from '../components/skeletons/RewardDetailSkeleton';

const RewardDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  
  useEffect(() => {
    const fetchRewardDetails = async () => {
      setLoading(true);
      try {
        const rewardData = await api.rewards.getReward(id);
        setReward(rewardData.reward);
      } catch (error) {
        console.error('Error fetching reward details:', error);
        toast.error(t('rewards.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchRewardDetails();
  }, [id, t]);

  // Verificar se o usuário tem AmaCoins suficientes
  const hasEnoughAmacoins = () => {
    if (!isAuthenticated || !user || !reward) return false;
    return user.amacoins >= reward.amacoins_cost;
  };

  // Verificar se a recompensa está disponível em estoque
  const isInStock = () => {
    if (!reward) return false;
    return reward.stock > 0;
  };

  // Manipular resgate da recompensa
  const handleRedeem = async () => {
    if (!isAuthenticated) {
      toast.info(t('rewards.loginToRedeem'));
      return;
    }

    if (!hasEnoughAmacoins()) {
      toast.error(t('rewards.notEnoughAmacoins'));
      return;
    }

    if (!isInStock()) {
      toast.error(t('rewards.outOfStock'));
      return;
    }

    try {
      setRedeeming(true);
      const resultAction = await dispatch(redeemReward(reward.id));
      
      if (redeemReward.fulfilled.match(resultAction)) {
        const { redemption } = resultAction.payload;
        setRedemptionCode(redemption.verification_code || redemption.id);
        setShowQRModal(true);
        toast.success(t('rewards.redeemSuccess'));
      }
    } catch (error) {
      console.error('Redemption failed:', error);
      toast.error(t('rewards.redeemError'));
    } finally {
      setRedeeming(false);
    }
  };

  // Compartilhar recompensa
  const shareReward = () => {
    if (navigator.share) {
      navigator.share({
        title: reward.name,
        text: reward.description,
        url: window.location.href,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback para copiar link para o clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('common.linkCopied'));
    }
  };

  if (loading) {
    return <RewardDetailSkeleton />;
  }

  if (!reward) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('rewards.notFound')}</h2>
          <p className="text-gray-600 mb-6">{t('rewards.cantFind')}</p>
          <Link to="/rewards">
            <Button>{t('rewards.backToRewards')}</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={reward.name}
        showBackButton
        backTo="/rewards"
        backgroundImage={reward.image_url}
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={shareReward}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ShareIcon className="h-5 w-5 mr-1" />
              {t('common.share')}
            </Button>
          </div>
        }
      />
      
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Detalhes principais */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              {/* Badges */}
              <div className="flex mb-4">
                <Badge color={reward.reward_type === 'physical_product' ? 'green' : 'blue'}>
                  {reward.reward_type === 'physical_product' 
                    ? t('rewards.physicalProduct')
                    : reward.reward_type === 'digital_service'
                      ? t('rewards.digitalService')
                      : t('rewards.discountCoupon')}
                </Badge>
                
                {reward.is_featured && (
                  <Badge color="yellow" className="ml-2">{t('rewards.featured')}</Badge>
                )}
                
                {isInStock() ? (
                  <Badge color="green" className="ml-2">{t('rewards.inStock')}</Badge>
                ) : (
                  <Badge color="red" className="ml-2">{t('rewards.outOfStock')}</Badge>
                )}
              </div>
              
              {/* Descrição */}
              <div className="prose max-w-none mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('rewards.about')}</h2>
                <p>{reward.description}</p>
              </div>
              
              {/* Detalhes da recompensa */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('rewards.details')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <GiftIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('rewards.type')}</h3>
                      <p className="text-sm text-gray-600">
                        {reward.reward_type === 'physical_product' 
                          ? t('rewards.physicalProduct')
                          : reward.reward_type === 'digital_service'
                            ? t('rewards.digitalService')
                            : t('rewards.discountCoupon')}
                      </p>
                    </div>
                  </div>
                  
                  {reward.reward_type === 'physical_product' && (
                    <div className="flex items-start">
                      <ShoppingBagIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{t('rewards.availableAt')}</h3>
                        <p className="text-sm text-gray-600">{reward.pickup_location}</p>
                      </div>
                    </div>
                  )}
                  
                  {reward.expiration_date && (
                    <div className="flex items-start">
                      <ClockIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{t('rewards.validUntil')}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(reward.expiration_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {reward.reward_type === 'discount_coupon' && (
                    <div className="flex items-start">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-amazon-green-500 mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{t('rewards.howToUse')}</h3>
                        <p className="text-sm text-gray-600">{t('rewards.showCouponAtLocation')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Termos e condições */}
              {reward.terms_conditions && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('rewards.termsConditions')}</h2>
                  <div className="prose prose-sm max-w-none">
                    <p>{reward.terms_conditions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar - Informações de resgate */}
          <div className="lg:col-span-1">
            {/* Custo e botão de resgate */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('rewards.cost')}</h3>
                <div className="flex items-center justify-center mb-4">
                  <GiftIcon className="h-6 w-6 text-amazon-green-500 mr-2" />
                  <span className="text-3xl font-bold text-amazon-green-600">{reward.amacoins_cost}</span>
                  <span className="ml-2 text-gray-600">AmaCoins</span>
                </div>
                
                {isAuthenticated ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">{t('rewards.yourBalance')}</p>
                    <p className="font-medium text-lg">
                      {user?.amacoins || 0} AmaCoins
                      {!hasEnoughAmacoins() && (
                        <span className="text-red-500 ml-2">
                          ({t('rewards.need')} {reward.amacoins_cost - (user?.amacoins || 0)} {t('rewards.more')})
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-4">{t('rewards.loginToSeeBalance')}</p>
                )}
                
                <Button
                  onClick={handleRedeem}
                  loading={redeeming}
                  disabled={
                    redeeming || 
                    !isAuthenticated || 
                    !hasEnoughAmacoins() || 
                    !isInStock()
                  }
                  className="w-full"
                >
                  {t('rewards.redeemNow')}
                </Button>
                
                {!isAuthenticated && (
                  <p className="mt-2 text-sm text-gray-600">
                    <Link to="/login" className="text-amazon-green-600 hover:text-amazon-green-800">
                      {t('rewards.loginFirst')}
                    </Link>
                  </p>
                )}
                
                {isAuthenticated && !hasEnoughAmacoins() && (
                  <p className="mt-2 text-sm text-gray-600">
                    <Link to="/events" className="text-amazon-green-600 hover:text-amazon-green-800">
                      {t('rewards.earnMoreAmacoins')}
                    </Link>
                  </p>
                )}
              </div>
            </div>
            
            {/* Informações do parceiro */}
            {reward.partner && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('rewards.partner')}</h3>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-amazon-earth-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amazon-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{reward.partner.business_name}</p>
                    <p className="text-xs text-gray-600">{reward.partner.business_type}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Instruções de resgate */}
            <div className="bg-amazon-river-50 border border-amazon-river-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amazon-river-800 mb-2">{t('rewards.howToRedeem')}</h3>
              <ol className="list-decimal ml-5 space-y-2 text-sm text-amazon-river-700">
                {reward.reward_type === 'physical_product' ? (
                  <>
                    <li>{t('rewards.step1Physical')}</li>
                    <li>{t('rewards.step2Physical')}</li>
                    <li>{t('rewards.step3Physical')}</li>
                  </>
                ) : (
                  <>
                    <li>{t('rewards.step1Digital')}</li>
                    <li>{t('rewards.step2Digital')}</li>
                    <li>{t('rewards.step3Digital')}</li>
                  </>
                )}
              </ol>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Modal de QR Code para resgate */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={t('rewards.redemptionCode')}
      >
        <div className="text-center p-4">
          <div className="mb-4">
            <QRCode value={redemptionCode} size={200} />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {reward?.reward_type === 'physical_product'
              ? t('rewards.showQrToPartner')
              : t('rewards.codeForDigitalReward')}
          </p>
          <div className="bg-gray-100 p-3 rounded-md flex items-center justify-center mb-4">
            <QrCodeIcon className="h-6 w-6 text-gray-500 mr-2" />
            <span className="text-lg font-mono font-bold tracking-wider">{redemptionCode}</span>
          </div>
          <p className="text-xs text-gray-500">{t('rewards.redemptionDisclaimer')}</p>
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

export default RewardDetail;