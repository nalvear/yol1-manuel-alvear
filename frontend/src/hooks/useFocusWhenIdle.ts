import { useCallback, useEffect, useRef, type RefObject } from 'react';

/**
 * Enfoca un elemento cuando termina una carga. Los campos están deshabilitados
 * mientras `busy` es true y un `focus()` en ese momento se ignora; el efecto
 * corre después del commit en que se vuelven a habilitar (o en que se monta
 * el elemento, como el resultado de una consulta).
 */
export const useFocusWhenIdle = (busy: boolean) => {
  const pending = useRef<RefObject<HTMLElement | null> | null>(null);

  useEffect(() => {
    if (busy || !pending.current) return;
    pending.current.current?.focus();
    pending.current = null;
  }, [busy]);

  return useCallback((target: RefObject<HTMLElement | null>) => {
    pending.current = target;
  }, []);
};
