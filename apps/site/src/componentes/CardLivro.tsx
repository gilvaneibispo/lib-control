import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Livro } from '../api/tipos';
import { classes } from '../utilitarios/classes';
import { listarAutores } from '../utilitarios/formatadores';
import { Capa } from './Capa';
import { SeloStatus } from './SeloStatus';

const DUAS_LINHAS: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export function CardLivro({ livro }: { livro: Livro }) {
  const temDisponibilidade = livro.disponivel !== undefined;

  const status = livro.disponivel
    ? 'disponivel'
    : 'indisponivel';

  return (
    <Link
      to={`/livros/${livro.id}`}
      className={classes(
        'card',
        'h-100',
        'text-decoration-none',
        'text-body',
      )}
    >
      <div className="p-2 pb-0">
        <Capa url={livro.capa_url} titulo={livro.titulo} />
      </div>

      <div
        className={classes(
          'card-body',
          'd-flex',
          'flex-column',
          'gap-1',
          'pt-2',
        )}
      >
        <div className="fw-semibold small" style={DUAS_LINHAS}>
          {livro.titulo}
        </div>

        <div
          className={classes(
            'small',
            'text-body-secondary',
            'text-truncate',
          )}
        >
          {listarAutores(livro.autores)}
        </div>

        <div
          className={classes(
            'd-flex',
            'align-items-center',
            'justify-content-between',
            'mt-auto',
            'pt-1',
            'gap-1',
          )}
        >
          <span className="small text-body-secondary">
            {livro.ano ?? ''}
          </span>

          {temDisponibilidade && <SeloStatus status={status} />}
        </div>
      </div>
    </Link>
  );
}
