# Módulo de Autenticação

Este módulo contém todos os componentes, hooks e serviços relacionados à autenticação de usuários da aplicação AmazôniaExperience.

## Componentes

- **LoginForm**: Formulário de login de usuários
- **RegisterForm**: Formulário de registro de novos usuários
- **ProfileForm**: Formulário de edição de perfil
- **PasswordChangeForm**: Formulário para alteração de senha
- **ForgotPasswordForm**: Formulário para recuperação de senha
- **ResetPasswordForm**: Formulário para redefinição de senha
- **VerifyEmail**: Componente para verificação de email
- **EmailVerificationSent**: Componente exibido após o registro
- **ResendVerificationEmail**: Formulário para reenvio de email de verificação
- **NotificationSettings**: Configuração de preferências de notificação
- **LogoutButton**: Botão para logout
- **AuthStatus**: Exibe o status de autenticação no cabeçalho

## Fluxos de Autenticação

### Registro e Verificação

1. O usuário se registra usando o `RegisterForm`
2. Após o registro bem-sucedido, o usuário é redirecionado para `EmailVerificationSent`
3. O usuário recebe um email com link de verificação
4. Ao clicar no link, o usuário acessa `VerifyEmail` que processa o token
5. Após verificação bem-sucedida, o usuário é redirecionado para login

### Login

1. O usuário acessa a página de login
2. Insere credenciais no `LoginForm`
3. Após login bem-sucedido, o usuário é redirecionado para a página inicial ou a página que estava tentando acessar

### Recuperação de Senha

1. Na página de login, o usuário clica em "Esqueceu a senha"
2. O usuário é redirecionado para `ForgotPasswordForm` onde insere seu email
3. Após envio, o usuário recebe um email com link de redefinição
4. Ao clicar no link, o usuário acessa `ResetPasswordForm`
5. Após redefinir a senha, o usuário é redirecionado para login

## Arquivos Relacionados em Outras Pastas

- **hooks/useAuth.js**: Hook personalizado para gerenciamento de autenticação
- **services/auth.js**: Serviço para operações de autenticação
- **utils/authStorage.js**: Utilitários para gerenciamento de tokens
- **api/auth.js**: Funções para interagir com a API de autenticação
- **redux/slices/authSlice.js**: Slice do Redux para estado de autenticação
- **contexts/AuthContext.jsx**: Contexto para gerenciamento de autenticação (alternativa ao Redux)

## Como Usar

### Importando Componentes

```javascript
// Importar um componente específico
import { LoginForm } from '../components/auth';

// Ou importar vários componentes
import { LoginForm, RegisterForm, LogoutButton } from '../components/auth';
```

### Usando o Hook useAuth

```javascript
import { useAuth } from '../hooks';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Verificar se o usuário está autenticado
  if (!isAuthenticated) {
    return <p>Faça login para continuar</p>;
  }
  
  return (
    <div>
      <p>Bem-vindo, {user.name}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### Protegendo Rotas

O projeto usa `PrivateRoute` e `RoleBasedRoute` para proteger rotas que requerem autenticação:

```javascript
// Em routes/index.js
import { PrivateRoute } from './PrivateRoute';
import { RoleBasedRoute } from './RoleBasedRoute';

// Rota que requer apenas autenticação
<PrivateRoute path="/profile">
  <ProfilePage />
</PrivateRoute>

// Rota que requer função específica
<RoleBasedRoute path="/admin" allowedRoles={['admin']}>
  <AdminPage />
</RoleBasedRoute>
```

## Estados de Autenticação

O sistema de autenticação mantém os seguintes estados:

- **isAuthenticated**: Indica se o usuário está autenticado
- **user**: Dados do usuário logado
- **token**: Token JWT para autenticação
- **refreshToken**: Token de atualização
- **isLoading**: Indica se uma operação de autenticação está em andamento
- **error**: Mensagem de erro, se houver

## Tokens e Segurança

Os tokens JWT são armazenados no `localStorage` e gerenciados pelos utilitários em `authStorage.js`. O sistema implementa:

- Rotação automática de tokens
- Verificação de expiração
- Logout automático em caso de falha no refresh
- Proteção contra CSRF

---

**Nota**: Este módulo depende dos componentes comuns (`Button`, `Input`, etc.) da pasta `components/common`. Certifique-se de que esses componentes estão implementados antes de usar os componentes de autenticação.