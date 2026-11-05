import type { ReactNode } from 'react';
import { classes } from '../utilitarios/classes';

interface Props {
  titulo: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
}

export function CabecalhoPagina({ titulo, descricao, acoes }: Props) {
  return (
    <header
      className={classes(
        'd-flex',
        'flex-wrap',
        'align-items-start',
        'justify-content-between',
        'gap-3',
        'mb-4',
      )}
    >
      <div>
        <h1 className="h3 mb-1">{titulo}</h1>

        {descricao && <p className="text-body-secondary mb-0">{descricao}</p>}
      </div>

      {acoes && <div className="d-flex gap-2">{acoes}</div>}
    </header>
  );
}
