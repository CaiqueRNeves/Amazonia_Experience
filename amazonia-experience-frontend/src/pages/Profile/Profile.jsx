import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { ProfileLayout } from '../../components/layout';
import { Button, Tabs } from '../../components/common';
import { InputField } from '../components/forms';
import { updateProfile } from '../redux/profile/profileSlice';
import { NATIONALITIES } from '../constants/nationalities';
import SelectField from '../components/forms/SelectField';

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Preencher formulário com dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        nationality: user.nationality || '',
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  if (!user) {
    return (
      <ProfileLayout>
        <div className="text-center">
          <p className="text-gray-600">{t('profile.loading')}</p>
        </div>
      </ProfileLayout>
    );
  }
  
  return (
    <ProfileLayout title={t('profile.generalTitle')}>
      <div className="max-w-3xl mx-auto">
        {/* Resumo de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-amazon-green-50 border border-amazon-green-100 rounded-lg p-4">
            <p className="text-sm text-amazon-green-600">{t('profile.amacoins')}</p>
            <p className="text-2xl font-bold text-amazon-green-800">{user.amacoins || 0}</p>
          </div>
          
          <div className="bg-amazon-river-50 border border-amazon-river-100 rounded-lg p-4">
            <p className="text-sm text-amazon-river-600">{t('profile.quizPoints')}</p>
            <p className="text-2xl font-bold text-amazon-river-800">{user.quiz_points || 0}</p>
          </div>
          
          <div className="bg-amazon-earth-50 border border-amazon-earth-100 rounded-lg p-4">
            <p className="text-sm text-amazon-earth-600">{t('profile.joinedOn')}</p>
            <p className="text-2xl font-bold text-amazon-earth-800">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Formulário de perfil */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">{t('profile.personalInfo')}</h3>
            
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                {t('profile.edit')}
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  {t('common.save')}
                </Button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField
                    label={t('profile.name')}
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                
                <div>
                  <SelectField
                    label={t('profile.nationality')}
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    options={NATIONALITIES.map((nat) => ({
                      value: nat.code,
                      label: nat.name,
                    }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div>
                <InputField
                  label={t('profile.email')}
                  type="email"
                  value={user.email}
                  disabled
                  helpText={t('profile.emailCannotChange')}
                />
              </div>
            </div>
          </form>
        </div>
        
        {/* Componente de alterar senha */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">{t('profile.security')}</h3>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-base font-medium text-gray-900">{t('profile.changePassword')}</h4>
                <p className="text-sm text-gray-600">{t('profile.passwordInfo')}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/profile/security'}
              >
                {t('profile.changePassword')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;