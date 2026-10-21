import { useEffect } from 'react';

const APP_NAME = 'Riesgo Financiero';

/** Título de la pestaña por página (ayuda a orientarse y a lectores de pantalla). */
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`;
  }, [title]);
};
