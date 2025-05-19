import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShareIcon, 
  EnvelopeIcon, 
  LinkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon
} from '../common/SocialIcons';

import Modal from '../common/Modal';
import { useToast } from '../../hooks/useToast';
import QRCode from '../common/QRCode';

const EventShare = ({ event }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  
  // URL do evento atual
  const eventUrl = `${window.location.origin}/events/${event.id}`;
  
  // Texto para compartilhamento
  const shareText = t('events.shareText', { 
    eventName: event.name,
    eventDate: new Date(event.start_time).toLocaleDateString(),
    eventLocation: event.location
  });
  
  // Compartilhar via redes sociais
  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    closeShareModal();
  };
  
  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    closeShareModal();
  };
  
  const shareViaWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${eventUrl}`)}`;
    window.open(url, '_blank');
    closeShareModal();
  };
  
  const shareViaTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    closeShareModal();
  };
  
  const shareViaEmail = () => {
    const subject = t('events.emailShareSubject', { eventName: event.name });
    const body = `${shareText}\n\n${eventUrl}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    closeShareModal();
  };
  
  // Copiar link para a área de transferência
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      showToast(t('common.linkCopied'), 'success');
      closeShareModal();
    } catch (err) {
      showToast(t('common.copyError'), 'error');
    }
  };
  
  // Compartilhar via API nativa, se disponível
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: shareText,
          url: eventUrl
        });
        closeShareModal();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      return false;
    }
  };
  
  // Abrir modal de compartilhamento
  const openShareModal = async () => {
    const sharedNatively = await handleNativeShare();
    if (!sharedNatively) {
      setShowShareModal(true);
    }
  };
  
  // Fechar modal de compartilhamento
  const closeShareModal = () => {
    setShowShareModal(false);
  };
  
  return (
    <>
      <button 
        onClick={openShareModal} 
        className="btn btn-outline-primary share-button"
        aria-label={t('common.share')}
      >
        <ShareIcon className="icon" />
        <span>{t('common.share')}</span>
      </button>
      
      <Modal
        isOpen={showShareModal}
        onClose={closeShareModal}
        title={t('events.shareEvent')}
      >
        <div className="share-modal-content">
          <button 
            onClick={closeShareModal}
            className="modal-close-button"
            aria-label={t('common.close')}
          >
            <XMarkIcon className="icon" />
          </button>
          
          <div className="event-share-preview">
            <h4>{event.name}</h4>
            <p className="event-date">
              {new Date(event.start_time).toLocaleDateString()}
            </p>
            <p className="event-location">{event.location}</p>
          </div>
          
          <div className="qr-code-container">
            <QRCode value={eventUrl} size={150} />
            <p className="qr-code-label">{t('events.scanToView')}</p>
          </div>
          
          <div className="share-options">
            <button onClick={shareViaFacebook} className="share-option facebook">
              <FacebookIcon className="icon" />
              <span>Facebook</span>
            </button>
            
            <button onClick={shareViaTwitter} className="share-option twitter">
              <TwitterIcon className="icon" />
              <span>Twitter</span>
            </button>
            
            <button onClick={shareViaWhatsapp} className="share-option whatsapp">
              <WhatsappIcon className="icon" />
              <span>WhatsApp</span>
            </button>
            
            <button onClick={shareViaTelegram} className="share-option telegram">
              <TelegramIcon className="icon" />
              <span>Telegram</span>
            </button>
            
            <button onClick={shareViaEmail} className="share-option email">
              <EnvelopeIcon className="icon" />
              <span>{t('common.email')}</span>
            </button>
            
            <button onClick={copyLink} className="share-option copy-link">
              <LinkIcon className="icon" />
              <span>{t('common.copyLink')}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EventShare;