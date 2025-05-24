import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { getProfile, updateProfile } from '../../redux/slices/userSlice';
import { Avatar, Button, Card, Form, Input, Select, Skeleton } from '../ui';
import { useForm } from '../../hooks';
import { nationalities } from '../../utils/constants';

const UserProfile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const initialValues = {
    name: user?.name || '',
    nationality: user?.nationality || '',
  };

  const validate = (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = t('validation.required');
    }
    return errors;
  };

  const { values, errors, handleChange, handleSubmit, setValues } = useForm(
    initialValues,
    async (formData) => {
      try {
        await dispatch(updateProfile(formData)).unwrap();
        toast.success(t('profile.updateSuccess'));
        setIsEditing(false);
      } catch (err) {
        toast.error(t('profile.updateError'));
      }
    },
    validate
  );

  useEffect(() => {
    if (user) {
      setValues({
        name: user.name || '',
        nationality: user.nationality || ''
      });
    }
  }, [user, setValues]);

  if (isLoading && !user) {
    return <Skeleton count={5} height={50} className="mb-4" />;
  }

  if (error) {
    return (
      <Card className="error-card">
        <h3>{t('common.error')}</h3>
        <p>{error}</p>
        <Button onClick={() => dispatch(getProfile())}>
          {t('common.tryAgain')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="user-profile">
      <Card>
        <div className="profile-header">
          <Avatar
            src={user?.avatar || `/images/default-avatar.png`}
            alt={user?.name}
            size="large"
          />
          <div className="profile-info">
            <h2>{!isEditing ? user?.name : t('profile.editing')}</h2>
            <p className="user-email">{user?.email}</p>
            <p className="user-role">{t(`roles.${user?.role}`)}</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">{t('profile.nationality')}:</span>
              <span className="detail-value">{user?.nationality || t('profile.notSpecified')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('profile.memberSince')}:</span>
              <span className="detail-value">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="action-buttons">
              <Button onClick={() => setIsEditing(true)} variant="primary">
                {t('profile.edit')}
              </Button>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="profile-form">
            <Form.Group>
              <Form.Label htmlFor="name">{t('profile.name')}</Form.Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label htmlFor="nationality">{t('profile.nationality')}</Form.Label>
              <Select
                id="nationality"
                name="nationality"
                value={values.nationality}
                onChange={handleChange}
                options={nationalities.map(nat => ({ value: nat, label: nat }))}
                placeholder={t('profile.selectNationality')}
              />
            </Form.Group>

            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? t('common.saving') : t('common.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;