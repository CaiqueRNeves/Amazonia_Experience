import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { register } from '../redux/auth/authSlice';
import Logo from '../components/common/Logo';
import InputField from '../components/forms/InputField';
import Button from '../components/common/Button';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import AuthCard from '../components/auth/AuthCard';
import SelectField from '../components/forms/SelectField';
import { NATIONALITIES } from '../constants/nationalities';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationality: '',
    agreeTerms: false,
  });

  const { name, email, password, confirmPassword, nationality, agreeTerms } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações básicas
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (!agreeTerms) {
      toast.error(t('auth.mustAgreeTerms'));
      return;
    }

    try {
      const resultAction = await dispatch(register({ name, email, password, nationality }));
      if (register.fulfilled.match(resultAction)) {
        toast.success(t('auth.registerSuccess'));
        navigate('/');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-6">
        <Logo className="h-12 w-auto mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">{t('auth.createAccount')}</h1>
        <p className="text-gray-600 mt-1">{t('auth.joinCommunity')}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label={t('auth.name')}
          type="text"
          name="name"
          value={name}
          onChange={handleChange}
          required
          placeholder={t('auth.fullName')}
        />

        <InputField
          label={t('auth.email')}
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          required
          placeholder="seu@email.com"
        />

        <SelectField
          label={t('auth.nationality')}
          name="nationality"
          value={nationality}
          onChange={handleChange}
          required
          options={NATIONALITIES.map((nat) => ({
            value: nat.code,
            label: nat.name,
          }))}
          placeholder={t('auth.selectNationality')}
        />

        <InputField
          label={t('auth.password')}
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          required
          placeholder="********"
        />

        <InputField
          label={t('auth.confirmPassword')}
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
          required
          placeholder="********"
        />

        <div className="flex items-center">
          <input
            id="agree-terms"
            name="agreeTerms"
            type="checkbox"
            checked={agreeTerms}
            onChange={handleChange}
            className="h-4 w-4 text-amazon-green-600 focus:ring-amazon-green-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
            {t('auth.agreeToTerms')}{' '}
            <Link to="/terms" className="text-amazon-green-600 hover:text-amazon-green-800">
              {t('auth.termsAndConditions')}
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {t('auth.register')}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
          </div>
        </div>

        <SocialLoginButtons />
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-medium text-amazon-green-600 hover:text-amazon-green-800">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};

export default Register;