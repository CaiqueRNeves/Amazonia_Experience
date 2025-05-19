# Hooks Personalizados

Esta pasta contém hooks React personalizados para uso em toda a aplicação AmazôniaExperience. Os hooks encapsulam lógica reutilizável e facilitam o gerenciamento de estados e efeitos colaterais.

## Hooks Disponíveis

### Autenticação e Usuário

- **useAuth**: Gerencia autenticação, login/logout e estado do usuário.
- **useForm**: Facilita a criação e validação de formulários com gestão de erros.

### Geolocalização e Mapas

- **useGeolocation**: Acessa e monitora a localização atual do dispositivo.
- **useMap**: Gerencia mapas interativos com Leaflet, incluindo marcadores e rotas.
- **useNearby**: Encontra locais, eventos ou serviços próximos à localização do usuário.

### Dados e Armazenamento

- **useLocalStorage**: Persiste dados no navegador com API simples, similar ao useState.
- **useOfflineStorage**: Adiciona sincronização e gerenciamento offline ao useLocalStorage.

### Funcionalidades da Aplicação

- **useQuiz**: Facilita a interação com quizzes, incluindo respostas e submissão.
- **useRewards**: Gerencia recompensas AmaCoins, resgates e histórico.
- **useCheckIn**: Lida com check-ins em eventos e lugares, validando proximidade.
- **useChatbot**: Facilita a interação com o assistente virtual da aplicação.
- **useEmergency**: Acessa serviços de emergência, contatos e frases úteis.

### UI e Experiência do Usuário

- **useNotifications**: Gerencia notificações locais e push notifications.
- **useNetworkStatus**: Monitora estado da conexão e implementa estratégias offline.
- **useTranslations**: Estende o hook i18n com funções adicionais para internacionalização.
- **useDebounce**: Controla a frequência de atualizações para melhorar a performance.
- **useModal**: Gerencia modais da aplicação com pilha de histórico.

## Como Usar

Os hooks podem ser importados individualmente:

```jsx
import { useAuth } from '../hooks/useAuth';

function LoginComponent() {
  const { login, isAuthenticated } = useAuth();
  // ...
}
```

Ou através do arquivo de índice para convenência:

```jsx
import { useAuth, useForm } from '../hooks';

function RegisterComponent() {
  const { register } = useAuth();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { name: '', email: '', password: '' },
    onSubmitRegister
  );
  // ...
}
```

## Diretrizes para Criação de Novos Hooks

1. **Um propósito claro**: Cada hook deve focar em uma preocupação específica.
2. **Documentação completa**: Documente inputs, outputs e efeitos colaterais.
3. **Independência**: Minimize dependências entre hooks.
4. **Consistência**: Siga padrões de nomenclatura e estrutura similares.
5. **Testes**: Inclua testes para comportamentos esperados e edge cases.

## Exemplos de Uso

### Exemplo: useGeolocation

```jsx
import { useGeolocation } from '../hooks';

function NearbyComponent() {
  const { location, error, loading } = useGeolocation();
  
  if (loading) return <p>Obtendo sua localização...</p>;
  if (error) return <p>Erro ao obter localização: {error}</p>;
  
  return (
    <div>
      <p>Sua localização: {location.latitude}, {location.longitude}</p>
      {/* Resto do componente */}
    </div>
  );
}
```

### Exemplo: useForm

```jsx
import { useForm } from '../hooks';

function ContactForm() {
  const initialValues = { name: '', email: '', message: '' };
  
  const validate = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Nome é obrigatório';
    if (!values.email) errors.email = 'Email é obrigatório';
    // Mais validações...
    return errors;
  };
  
  const onSubmit = async (values) => {
    // Enviar formulário...
    console.log('Formulário enviado:', values);
  };
  
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useForm(initialValues, onSubmit, validate);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário... */}
    </form>
  );
}
```

### Exemplo: useLocalStorage

```jsx
import { useLocalStorage } from '../hooks';

function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <button onClick={toggleTheme}>
      Tema atual: {theme}
    </button>
  );
}
```