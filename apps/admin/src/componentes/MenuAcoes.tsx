import { classes } from '../utilitarios/classes';

export interface ItemAcao {
  rotulo: string;
  icone: string;
  aoSelecionar: () => void;
  perigo?: boolean;
  desabilitado?: boolean;
}

interface Props {
  rotulo: string;
  itens: ItemAcao[];
}

export function MenuAcoes({ rotulo, itens }: Props) {
  return (
    <div className="dropdown">
      <button
        type="button"
        className={classes(
          'btn',
          'btn-sm',
          'btn-link',
          'text-body',
          'p-1',
        )}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={rotulo}
      >
        <i className="bi bi-three-dots" aria-hidden="true" />
      </button>

      <ul className="dropdown-menu dropdown-menu-end">
        {itens.map((item) => (
          <li key={item.rotulo}>
            <button
              type="button"
              className={classes(
                'dropdown-item',
                item.perigo && 'text-danger',
              )}
              disabled={item.desabilitado}
              onClick={item.aoSelecionar}
            >
              <i className={`bi bi-${item.icone} me-2`} aria-hidden="true" />
              {item.rotulo}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
