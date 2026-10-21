import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/auth';
import { useFocusWhenIdle } from '../../hooks/useFocusWhenIdle';
import { messageForError, type UserMessage } from '../../utils/messages';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';
import { DemoCredentials } from './DemoCredentials';
import styles from './LoginForm.module.css';

/** Límites de `LoginRequest` en openapi.yaml. */
const MAX_USERNAME = 100;
const MAX_PASSWORD = 200;

type Field = 'username' | 'password';
type FieldErrors = Partial<Record<Field, string>>;

const validate = (username: string, password: string): FieldErrors => {
  const errors: FieldErrors = {};
  if (!username.trim()) errors.username = 'Ingresa tu usuario.';
  if (!password) errors.password = 'Ingresa tu contraseña.';
  return errors;
};

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [dirty, setDirty] = useState<Record<Field, boolean>>({ username: false, password: false });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ username: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<UserMessage | null>(null);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const focusWhenIdle = useFocusWhenIdle(loading);

  const errors = validate(username, password);
  // Los errores aparecen al intentar enviar, o al salir de un campo que ya se editó;
  // nunca mientras se escribe ni al pasar por un campo vacío sin tocarlo.
  const visibleError = (field: Field) =>
    submitted || (dirty[field] && touched[field]) ? errors[field] : undefined;

  const onChange = (field: Field, value: string) => {
    if (field === 'username') setUsername(value);
    else setPassword(value);
    setDirty((d) => ({ ...d, [field]: true }));
    setApiError(null);
  };

  const onPasswordKey = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(event.getModifierState('CapsLock'));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current) return; // Evita doble envío (doble clic o Enter repetido).

    setSubmitted(true);
    if (errors.username) return usernameRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();

    inFlight.current = true;
    setLoading(true);
    setApiError(null);
    try {
      await login({ username: username.trim(), password });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/score', { replace: true });
    } catch (error) {
      setApiError(messageForError(error));
      // Se limpia la contraseña sin marcarla como error: el mensaje del API ya explica qué pasó.
      setPassword('');
      setDirty((d) => ({ ...d, password: false }));
      setTouched((t) => ({ ...t, password: false }));
      setSubmitted(false);
      focusWhenIdle(passwordRef);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  const fillDemo = (demoUser: string, demoPassword: string) => {
    setUsername(demoUser);
    setPassword(demoPassword);
    setApiError(null);
    passwordRef.current?.focus();
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={loading}>
      {apiError && (
        <Alert tone={apiError.tone} title={apiError.title} onDismiss={() => setApiError(null)}>
          {apiError.description}
        </Alert>
      )}

      <TextField
        ref={usernameRef}
        label="Usuario"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        autoFocus
        maxLength={MAX_USERNAME}
        value={username}
        onChange={(e) => onChange('username', e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, username: true }))}
        error={visibleError('username')}
        disabled={loading}
      />

      <TextField
        ref={passwordRef}
        label="Contraseña"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        maxLength={MAX_PASSWORD}
        value={password}
        onChange={(e) => onChange('password', e.target.value)}
        onKeyUp={onPasswordKey}
        onKeyDown={onPasswordKey}
        onBlur={() => {
          setTouched((t) => ({ ...t, password: true }));
          setCapsLock(false);
        }}
        error={visibleError('password')}
        hint={capsLock ? <span className={styles.capsLock}>Bloq Mayús está activado.</span> : undefined}
        disabled={loading}
        endAdornment={
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            disabled={loading}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        }
      />

      <Button type="submit" fullWidth loading={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </Button>

      <DemoCredentials onSelect={fillDemo} disabled={loading} />
    </form>
  );
}
