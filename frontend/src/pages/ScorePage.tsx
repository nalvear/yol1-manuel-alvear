import { useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { fetchScore } from '../api/endpoints';
import type { ScoreResponse } from '../api/types';
import { RutField } from '../components/score/RutField';
import { ScoreHistory } from '../components/score/ScoreHistory';
import { ScoreResult } from '../components/score/ScoreResult';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/auth';
import { useFocusWhenIdle } from '../hooks/useFocusWhenIdle';
import { messageForCode, messageForError, type UserMessage } from '../utils/messages';
import { isSameRut, RUT_ERROR_MESSAGES, validateRut } from '../utils/rut';
import styles from './ScorePage.module.css';

const HISTORY_LIMIT = 5;

export function ScorePage() {
  const { session } = useAuth();
  const user = session?.user;
  const ownRut = user?.role === 'user' ? user.rut : null;

  // Para el rol user el campo parte con su propio RUT: es el único que puede consultar.
  const [rut, setRut] = useState(ownRut ?? '');
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<UserMessage | null>(null);
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [history, setHistory] = useState<ScoreResponse[]>([]);

  const rutRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const requestId = useRef(0);
  const focusWhenIdle = useFocusWhenIdle(loading);

  const validation = validateRut(rut);
  const fieldError =
    !validation.valid && (touched || submitted) ? RUT_ERROR_MESSAGES[validation.reason] : undefined;
  // Chequeo anticipado de permisos: evita una consulta que el API rechazaría con 403.
  const forbidden = validation.valid && ownRut !== null && !isSameRut(rut, ownRut);
  const forbiddenMessage = messageForCode('FORBIDDEN_RUT');

  const onRutChange = (value: string) => {
    setRut(value);
    setApiError(null);
  };

  const fillOwnRut = () => {
    if (!ownRut) return;
    setRut(ownRut);
    setApiError(null);
    rutRef.current?.focus();
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading || !session) return; // Evita doble envío.

    setSubmitted(true);
    if (!validation.valid || forbidden) {
      rutRef.current?.focus();
      return;
    }

    const id = ++requestId.current;
    setLoading(true);
    setApiError(null);
    try {
      const response = await fetchScore(validation.normalized, session.token);
      if (id !== requestId.current) return; // Respuesta de una consulta anterior.
      setResult(response);
      setHistory((items) => [response, ...items].slice(0, HISTORY_LIMIT));
      // Lleva el foco al resultado para que lectores de pantalla lo anuncien.
      focusWhenIdle(resultRef);
    } catch (error) {
      if (id !== requestId.current) return;
      // Los 401 de token ya cierran la sesión desde el AuthProvider.
      if (error instanceof ApiError && error.isSessionError) return;
      setApiError(messageForError(error));
      focusWhenIdle(rutRef);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const onClear = () => {
    setRut(ownRut ?? '');
    setTouched(false);
    setSubmitted(false);
    setApiError(null);
    rutRef.current?.focus();
  };

  const validHint = validation.valid && !forbidden ? (
    <span className={styles.validHint}>✓ RUT válido</span>
  ) : (
    'Puedes escribirlo con o sin puntos y guion.'
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Consulta de score</h1>
        <p className={styles.subtitle}>
          {ownRut
            ? 'Tu perfil permite consultar el score del RUT asociado a tu cuenta.'
            : 'Como administrador puedes consultar el score de cualquier RUT.'}
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <Card>
            <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={loading}>
              <RutField
                ref={rutRef}
                value={rut}
                onChange={onRutChange}
                onBlur={() => setTouched(true)}
                error={fieldError}
                hint={validHint}
                disabled={loading}
              />

              {forbidden && (
                <Alert tone="warning" title={forbiddenMessage.title}>
                  <p>{forbiddenMessage.description}</p>
                  <button type="button" className={styles.inlineAction} onClick={fillOwnRut}>
                    Usar mi RUT ({ownRut})
                  </button>
                </Alert>
              )}

              {apiError && (
                <Alert tone={apiError.tone} title={apiError.title} onDismiss={() => setApiError(null)}>
                  {apiError.description}
                </Alert>
              )}

              <div className={styles.actions}>
                <Button type="submit" loading={loading}>
                  {loading ? 'Consultando…' : 'Consultar score'}
                </Button>
                <Button variant="secondary" onClick={onClear} disabled={loading}>
                  Limpiar
                </Button>
              </div>
            </form>
          </Card>

          <div aria-live="polite">
            {result ? (
              <ScoreResult ref={resultRef} result={result} />
            ) : (
              <Card tone="sand" className={styles.empty}>
                <p className={styles.emptyTitle}>Aún no hay consultas</p>
                <p>Ingresa un RUT y presiona “Consultar score” para ver el resultado.</p>
              </Card>
            )}
          </div>
        </div>

        <aside className={styles.aside}>
          <ScoreHistory items={history} activeFecha={result?.fecha} onSelect={setResult} />
        </aside>
      </div>
    </div>
  );
}
