import { useState, type CSSProperties } from 'react';
import { classes } from '../utilitarios/classes';

interface Props {
  url?: string | null;
  titulo: string;
  mini?: boolean;
}

const PROPORCAO_LIVRO = { '--bs-aspect-ratio': '150%' } as CSSProperties;

const TAMANHO_MINI = { width: 48, height: 72 };

export function Capa({ url, titulo, mini = false }: Props) {
  const [falhou, setFalhou] = useState(false);

  const semImagem = !url || falhou;

  if (mini && semImagem) {
    return (
      <span
        className={classes(
          'd-inline-flex',
          'align-items-center',
          'justify-content-center',
          'flex-shrink-0',
          'rounded',
          'bg-body-secondary',
          'text-body-secondary',
        )}
        style={TAMANHO_MINI}
        role="img"
        aria-label={`Sem capa: ${titulo}`}
      >
        <i className="bi bi-book" aria-hidden="true" />
      </span>
    );
  }

  if (mini) {
    return (
      <img
        className={classes(
          'rounded',
          'flex-shrink-0',
          'object-fit-cover',
        )}
        style={TAMANHO_MINI}
        src={url ?? undefined}
        alt={`Capa de ${titulo}`}
        loading="lazy"
        onError={() => setFalhou(true)}
      />
    );
  }

  return (
    <div
      className={classes(
        'ratio',
        'rounded',
        'overflow-hidden',
        'bg-body-secondary',
      )}
      style={PROPORCAO_LIVRO}
    >
      {semImagem ? (
        <div
          className={classes(
            'd-flex',
            'flex-column',
            'align-items-center',
            'justify-content-center',
            'gap-2',
            'text-body-secondary',
          )}
          role="img"
          aria-label={`${titulo}: livro sem capa disponível`}
        >
          <i className="bi bi-book fs-1" aria-hidden="true" />

          <span className="small">Sem capa disponível</span>
        </div>
      ) : (
        <img
          className="object-fit-cover"
          src={url}
          alt={`Capa de ${titulo}`}
          loading="lazy"
          onError={() => setFalhou(true)}
        />
      )}
    </div>
  );
}
