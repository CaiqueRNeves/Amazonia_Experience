/**
 * Índice de componentes de autenticação
 * Exporta todos os componentes relacionados à autenticação de um único lugar
 */

// Formulários e componentes de autenticação
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ProfileForm from './ProfileForm';
import PasswordChangeForm from './PasswordChangeForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';
import VerifyEmail from './VerifyEmail';
import EmailVerificationSent from './EmailVerificationSent';
import ResendVerificationEmail from './ResendVerificationEmail';
import NotificationSettings from './NotificationSettings';
import LogoutButton from './LogoutButton';
import AuthStatus from './AuthStatus';

// Exportações para facilitar importações
export {
  LoginForm,
  RegisterForm,
  ProfileForm,
  PasswordChangeForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  VerifyEmail,
  EmailVerificationSent,
  ResendVerificationEmail,
  NotificationSettings,
  LogoutButton,
  AuthStatus
};

// Exportação padrão para uso como conjunto
export default {
  LoginForm,
  RegisterForm,
  ProfileForm,
  PasswordChangeForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  VerifyEmail,
  EmailVerificationSent,
  ResendVerificationEmail,
  NotificationSettings,
  LogoutButton,
  AuthStatus
};