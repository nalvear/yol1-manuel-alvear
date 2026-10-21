import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './TextField.module.css';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Elemento al final del input (ej. botón mostrar contraseña). */
  endAdornment?: ReactNode;
}

/** Campo de texto con label, ayuda y error asociados para lectores de pantalla. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, endAdornment, className, ...rest },
  ref,
) {
  const id = useId();
  // El error reemplaza a la ayuda en el mismo espacio para no desplazar el formulario
  // (un salto de layout puede hacer que un clic caiga fuera del botón).
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          ref={ref}
          id={id}
          className={[styles.input, error && styles.invalid, endAdornment && styles.withAdornment]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        {endAdornment && <div className={styles.adornment}>{endAdornment}</div>}
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <div id={hintId} className={styles.hint}>
            {hint}
          </div>
        )
      )}
    </div>
  );
});
