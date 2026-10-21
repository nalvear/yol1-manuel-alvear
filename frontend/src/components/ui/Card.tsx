import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: 'surface' | 'sand';
  as?: 'section' | 'article' | 'div';
}

export function Card({ tone = 'surface', as: Tag = 'section', className, ...rest }: CardProps) {
  return <Tag className={[styles.card, styles[tone], className].filter(Boolean).join(' ')} {...rest} />;
}
