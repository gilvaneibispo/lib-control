import { classes } from '../utilitarios/classes';

interface Props {
  pagina: number;
  ultima: number;
  aoMudar: (pagina: number) => void;
}

export function Paginacao({ pagina, ultima, aoMudar }: Props) {
  if (ultima <= 1) return null;

  const naPrimeira = pagina <= 1;
  const naUltima = pagina >= ultima;

  return (
    <nav
      className={classes(
        'd-flex',
        'align-items-center',
        'justify-content-between',
        'gap-2',
        'mt-3',
      )}
      aria-label="Paginação"
    >
      <span className="small text-body-secondary">
        Página {pagina} de {ultima}
      </span>

      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={naPrimeira}
          onClick={() => aoMudar(pagina - 1)}
        >
          <i className="bi bi-chevron-left me-1" aria-hidden="true" />
          Anterior
        </button>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={naUltima}
          onClick={() => aoMudar(pagina + 1)}
        >
          Próxima
          <i className="bi bi-chevron-right ms-1" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
