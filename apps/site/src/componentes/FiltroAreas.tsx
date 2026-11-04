import { useEffect, useRef, useState } from 'react';
import type { Area, Subarea } from '../api/tipos';
import {
  alternarArea,
  alternarSubarea,
  estadoArea,
  subareaMarcada,
  totalSelecionado,
  type EstadoArea,
  type SelecaoAreas,
} from '../filtroAreas';
import { classes } from '../utilitarios/classes';

interface Props {
  areas: Area[];
  selecao: SelecaoAreas;
  aoMudar: (selecao: SelecaoAreas) => void;
}

interface PropsCaixaArea {
  estado: EstadoArea;
  rotulo: string;
  aoAlternar: () => void;
}

const SELECAO_VAZIA: SelecaoAreas = { areas: [], subareas: [] };

function CaixaArea({ estado, rotulo, aoAlternar }: PropsCaixaArea) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = estado === 'parcial';
  }, [estado]);

  const ariaChecked = (estado === 'parcial')
    ? 'mixed'
    : estado === 'marcada';

  return (
    <input
      ref={ref}
      type="checkbox"
      className={classes(
        'form-check-input',
        'm-0',
        'flex-shrink-0',
      )}
      checked={estado === 'marcada'}
      aria-checked={ariaChecked}
      aria-label={`Filtrar por ${rotulo}`}
      onChange={aoAlternar}
    />
  );
}

function Contador({ valor }: { valor?: number }) {
  return (
    <span className="badge bg-body-secondary text-body-secondary">
      {valor ?? 0}
    </span>
  );
}

export function FiltroAreas({ areas, selecao, aoMudar }: Props) {
  const [escolhas, setEscolhas] = useState<Record<number, boolean>>({});

  const total = totalSelecionado(selecao);

  function estaAberta(area: Area): boolean {
    const escolha = escolhas[area.id];

    if (escolha !== undefined) return escolha;

    return estadoArea(selecao, area) === 'parcial';
  }

  function alternarAberta(area: Area) {
    const novoValor = !estaAberta(area);

    setEscolhas((atual) => ({ ...atual, [area.id]: novoValor }));
  }

  function aoAlternarArea(area: Area) {
    const nova = alternarArea(selecao, area);

    aoMudar(nova);
  }

  function aoAlternarSubarea(area: Area, subareaId: number) {
    const nova = alternarSubarea(selecao, area, subareaId);

    aoMudar(nova);
  }

  function itemSubarea(area: Area, sub: Subarea) {
    const marcada = subareaMarcada(selecao, area, sub.id);
    const id = `sub-chk-${sub.id}`;

    return (
      <li key={sub.id} role="treeitem" aria-selected={marcada}>
        <label
          htmlFor={id}
          className={classes(
            'd-flex',
            'align-items-center',
            'gap-2',
            'py-1',
            'small',
          )}
          style={{ cursor: 'pointer' }}
        >
          <input
            id={id}
            type="checkbox"
            className={classes(
              'form-check-input',
              'm-0',
              'flex-shrink-0',
            )}
            checked={marcada}
            onChange={() => aoAlternarSubarea(area, sub.id)}
          />

          <span
            className={classes(
              'flex-grow-1',
              'text-truncate',
              marcada && 'fw-semibold',
            )}
          >
            {sub.nome}
          </span>

          <Contador valor={sub.livros_count} />
        </label>
      </li>
    );
  }

  function itemArea(area: Area) {
    const estado = estadoArea(selecao, area);
    const aberta = estaAberta(area);

    const chevron = aberta
      ? 'bi-chevron-up'
      : 'bi-chevron-down';

    return (
      <li
        key={area.id}
        role="treeitem"
        aria-expanded={aberta}
        aria-selected={estado === 'marcada'}
      >
        <div className="d-flex align-items-center gap-2 py-1">
          <CaixaArea
            estado={estado}
            rotulo={area.nome}
            aoAlternar={() => aoAlternarArea(area)}
          />

          <button
            type="button"
            className={classes(
              'btn',
              'btn-link',
              'btn-sm',
              'p-0',
              'text-body',
              'text-decoration-none',
              'd-flex',
              'align-items-center',
              'gap-2',
              'flex-grow-1',
              'text-start',
            )}
            style={{ minWidth: 0 }}
            onClick={() => alternarAberta(area)}
            aria-controls={`sub-${area.id}`}
          >
            <span
              className={classes(
                'flex-grow-1',
                'text-truncate',
                estado !== 'vazia' && 'fw-semibold',
              )}
            >
              {area.nome}
            </span>

            <Contador valor={area.livros_count} />

            <i className={`bi ${chevron}`} aria-hidden="true" />
          </button>
        </div>

        {aberta && (
          <ul id={`sub-${area.id}`} role="group" className="list-unstyled ms-4 mb-1">
            {area.subareas?.map((sub) => itemSubarea(area, sub))}
          </ul>
        )}
      </li>
    );
  }

  const sufixoPlural = (total > 1)
    ? 's'
    : '';

  return (
    <div>
      <div
        className={classes(
          'd-flex',
          'align-items-center',
          'justify-content-between',
          'mb-1',
        )}
      >
        <span className="form-label m-0">
          Áreas

          {total > 0 && (
            <span className="badge rounded-pill text-bg-primary ms-2">
              {total} selecionada{sufixoPlural}
            </span>
          )}
        </span>

        {total > 0 && (
          <button
            type="button"
            className="btn btn-link btn-sm p-0"
            onClick={() => aoMudar(SELECAO_VAZIA)}
          >
            limpar
          </button>
        )}
      </div>

      <p className="small text-body-secondary mb-2">
        Marque uma ou mais áreas; clique no nome para ver as sub-áreas.
      </p>

      <ul
        className="list-unstyled m-0"
        role="tree"
        aria-multiselectable="true"
        aria-label="Áreas e sub-áreas"
      >
        {areas.map(itemArea)}
      </ul>
    </div>
  );
}
