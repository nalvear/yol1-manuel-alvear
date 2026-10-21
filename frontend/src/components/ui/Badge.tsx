import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  tone?: 'lime' | 'sand' | 'outline-dark';
  children: ReactNode;
}

export function Badge({ tone = 'sand', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
