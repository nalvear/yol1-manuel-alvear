import { forwardRef, type ReactNode } from 'react';
import { formatRutInput } from '../../utils/rut';
import { TextField } from '../ui/TextField';

interface RutFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: ReactNode;
  disabled?: boolean;
  endAdornment?: ReactNode;
}

/**
 * Input de RUT que formatea mientras se escribe (12.345.678-5), descarta
 * caracteres no válidos y limita el largo. Teclado de texto (no numérico)
 * porque el dígito verificador puede ser K.
 */
export const RutField = forwardRef<HTMLInputElement, RutFieldProps>(function RutField(
  { value, onChange, onBlur, error, hint, disabled, endAdornment },
  ref,
) {
  return (
    <TextField
      ref={ref}
      label="RUT"
      name="rut"
      placeholder="12.345.678-5"
      inputMode="text"
      autoComplete="off"
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      maxLength={12}
      value={value}
      onChange={(e) => onChange(formatRutInput(e.target.value))}
      onBlur={onBlur}
      error={error}
      hint={hint}
      disabled={disabled}
      endAdornment={endAdornment}
    />
  );
});
