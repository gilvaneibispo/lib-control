import type { ReactNode } from 'react';
import { classes } from '../utilitarios/classes';

interface Props {
  tom?: 'danger' | 'info';
  titulo?: ReactNode;
  icone?: string;
  children?: ReactNode;
}

export function Alerta({ tom = 'info', titulo, icone, children }: Props) {
  const grave = tom === 'danger';

  const iconePadrao = grave
    ? 'slash-circle'
    : 'info-circle';

  const papel = grave
    ? 'alert'
    : 'status';

  const iconeFinal = icone ?? iconePadrao;

  return (
    <div
      className={classes(
        'alert',
        `alert-${tom}`,
        'd-flex',
        'gap-2',
        'mb-0',
      )}
      role={papel}
    >
      <i className={`bi bi-${iconeFinal}`} aria-hidden="true" />

      <div className="flex-grow-1">
        {titulo && <p className="fw-semibold mb-1">{titulo}</p>}

        {children}
      </div>
    </div>
  );
}
