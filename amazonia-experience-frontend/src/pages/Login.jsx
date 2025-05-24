import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { login } from '../redux/auth/authSlice';
import Logo from '../components/common/Logo';
import InputField from '../components/forms/InputField';
import Button from '../components/common/Button';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import AuthCard from '../components/auth/AuthCard';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const { email, password, rememberMe } = formData;

  // Determinar para onde redirecionar após o login bem-sucedido
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        toast.success(t('auth.loginSuccess'));
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <AuthCard>
      <div className="text-center mb-6">
        <Logo className="h-12 w-auto mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">{t('auth.welcomeBack')}</h1>
        <p className="text-gray-600 mt-1">{t('auth.loginToContinue')}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label={t('auth.email')}
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          required
          placeholder="seu@email.com"
        />
        
        <div>
          <InputField
            label={t('auth.password')}
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            placeholder="********"
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-amazon-green-600 focus:ring-amazon-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                {t('auth.rememberMe')}
              </label>
            </div>
            
            <Link to="/forgot-password" className="text-sm text-amazon-green-600 hover:text-amazon-green-800">
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {t('auth.login')}
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
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="font-medium text-amazon-green-600 hover:text-amazon-green-800">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};

export default Login;