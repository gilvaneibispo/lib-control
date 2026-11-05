import type { ReactNode } from 'react';
import { classes } from '../utilitarios/classes';

interface Props {
  icone?: string;
  titulo: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
}

export function EstadoVazio({ icone = 'inbox', titulo, descricao, acao }: Props) {
  return (
    <div
      className={classes(
        'text-center',
        'text-body-secondary',
        'py-5',
      )}
      role="status"
    >
      <i
        className={classes(
          'bi',
          `bi-${icone}`,
          'fs-1',
          'd-block',
          'mb-2',
        )}
        aria-hidden="true"
      />

      <p className="fw-semibold text-body mb-1">{titulo}</p>

      {descricao && <p className="small mb-0">{descricao}</p>}

      {acao && <div className="mt-3">{acao}</div>}
    </div>
  );
}
