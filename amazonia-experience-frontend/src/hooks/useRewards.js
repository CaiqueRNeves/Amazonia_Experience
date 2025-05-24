import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para gerenciar recompensas
 * Fornece funções para listar e resgatar recompensas
 * 
 * @param {number} rewardId - ID opcional da recompensa específica
 * @returns {Object} Funções e estados para gerenciar recompensas
 */
const useRewards = (rewardId = null) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Estados do Redux relacionados a recompensas
  const {
    rewards,
    physicalRewards,
    digitalRewards,
    currentReward,
    redemption,
    redemptions,
    filters
  } = useSelector((state) => state.rewards);
  
  // Estado do usuário para verificar o saldo
  const { user } = useSelector((state) => state.auth);
  
  // Importar ações do Redux
  const {
    getRewards,
    getPhysicalRewards,
    getDigitalRewards,
    getRewardById,
    redeemReward,
    getRedemptions,
    setFilters,
    clearFilters,
    resetRedemption
  } = require('../redux/slices/rewardsSlice');
  
  // Buscar recompensas com filtros
  const fetchRewards = useCallback(async (params = {}) => {
    try {
      // Mescla os filtros atuais com os parâmetros fornecidos
      const queryParams = {
        ...filters,
        ...params
      };
      
      const resultAction = await dispatch(getRewards(queryParams));
      return getRewards.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return false;
    }
  }, [dispatch, getRewards, filters]);
  
  // Buscar recompensas físicas
  const fetchPhysicalRewards = useCallback(async (params = {}) => {
    try {
      const resultAction = await dispatch(getPhysicalRewards(params));
      return getPhysicalRewards.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Error fetching physical rewards:', error);
      return false;
    }
  }, [dispatch, getPhysicalRewards]);
  
  // Buscar recompensas digitais
  const fetchDigitalRewards = useCallback(async (params = {}) => {
    try {
      const resultAction = await dispatch(getDigitalRewards(params));
      return getDigitalRewards.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Error fetching digital rewards:', error);
      return false;
    }
  }, [dispatch, getDigitalRewards]);
  
  // Buscar detalhes de uma recompensa específica
  const fetchRewardDetails = useCallback(async (id = rewardId) => {
    if (!id) return false;
    
    try {
      const resultAction = await dispatch(getRewardById(id));
      return getRewardById.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Error fetching reward details:', error);
      return false;
    }
  }, [dispatch, getRewardById, rewardId]);
  
  // Resgatar uma recompensa
  const redeem = useCallback(async (id = rewardId) => {
    if (!id) {
      toast.error(t('rewards.noRewardSelected'));
      return false;
    }
    
    // Verificar se o usuário está autenticado
    if (!user) {
      toast.error(t('rewards.loginRequired'));
      return false;
    }
    
    // Verificar se a recompensa existe nos dados disponíveis
    let reward = currentReward.data;
    
    // Se não houver dados da recompensa atual, buscar os detalhes
    if (!reward) {
      try {
        await fetchRewardDetails(id);
        reward = currentReward.data;
      } catch (error) {
        console.error('Error fetching reward before redemption:', error);
      }
    }
    
    // Verificar se o usuário tem AmaCoins suficientes (se tivermos os dados da recompensa)
    if (reward && user.amacoins < reward.amacoins_cost) {
      toast.error(t('rewards.insufficientAmacoins'));
      return false;
    }
    
    try {
      const resultAction = await dispatch(redeemReward(id));
      
      if (redeemReward.fulfilled.match(resultAction)) {
        toast.success(t('rewards.redemptionSuccess'));
        return resultAction.payload;
      } else {
        toast.error(resultAction.error.message || t('rewards.redemptionError'));
        return false;
      }
    } catch (error) {
      toast.error(t('rewards.redemptionError'));
      console.error('Error redeeming reward:', error);
      return false;
    }
  }, [dispatch, redeemReward, rewardId, currentReward.data, user, fetchRewardDetails, t]);
  
  // Buscar histórico de resgates
  const fetchRedemptionHistory = useCallback(async (params = {}) => {
    try {
      const resultAction = await dispatch(getRedemptions(params));
      return getRedemptions.fulfilled.match(resultAction);
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      return false;
    }
  }, [dispatch, getRedemptions]);
  
  // Atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch, setFilters]);
  
  // Limpar filtros
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch, clearFilters]);
  
  // Limpar estado de resgate
  const resetRedemptionState = useCallback(() => {
    dispatch(resetRedemption());
  }, [dispatch, resetRedemption]);
  
  // Verifica se o usuário pode resgatar uma recompensa
  const canRedeem = useCallback((reward) => {
    if (!user || !reward) return false;
    
    // Verificar se o usuário tem AmaCoins suficientes
    const hasEnoughAmacoins = user.amacoins >= reward.amacoins_cost;
    
    // Verificar se a recompensa está em estoque
    const isInStock = reward.stock > 0;
    
    return hasEnoughAmacoins && isInStock;
  }, [user]);
  
  // Formatar categorias de recompensas para exibição
  const formatCategory = useCallback((category) => {
    switch (category) {
      case 'physical_product':
        return t('rewards.categories.physicalProduct');
      case 'digital_service':
        return t('rewards.categories.digitalService');
      case 'discount_coupon':
        return t('rewards.categories.discountCoupon');
      case 'experience':
        return t('rewards.categories.experience');
      default:
        return category;
    }
  }, [t]);
  
  return {
    // Estados
    rewards: rewards.data,
    rewardsLoading: rewards.isLoading,
    rewardsError: rewards.error,
    physicalRewards: physicalRewards.data,
    physicalRewardsLoading: physicalRewards.isLoading,
    digitalRewards: digitalRewards.data,
    digitalRewardsLoading: digitalRewards.isLoading,
    currentReward: currentReward.data,
    currentRewardLoading: currentReward.isLoading,
    redemption: redemption.data,
    redemptionLoading: redemption.isLoading,
    redemptionSuccess: redemption.success,
    redemptionError: redemption.error,
    redemptionHistory: redemptions.data,
    redemptionHistoryLoading: redemptions.isLoading,
    filters,
    
    // Funções
    fetchRewards,
    fetchPhysicalRewards,
    fetchDigitalRewards,
    fetchRewardDetails,
    redeem,
    fetchRedemptionHistory,
    updateFilters,
    resetFilters,
    resetRedemptionState,
    canRedeem,
    formatCategory
  };
};

export default useRewards;