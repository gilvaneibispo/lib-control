import { classes } from '../utilitarios/classes';

export interface Aba {
  valor: string;
  rotulo: string;
}

interface Props {
  abas: Aba[];
  ativa: string;
  aoMudar: (valor: string) => void;
}

export function Abas({ abas, ativa, aoMudar }: Props) {
  return (
    <ul className="nav nav-tabs mb-3" role="tablist">
      {abas.map((aba) => {
        const selecionada = aba.valor === ativa;

        return (
          <li key={aba.valor} className="nav-item" role="presentation">
            <button
              type="button"
              role="tab"
              className={classes(
                'nav-link',
                selecionada && 'active',
              )}
              aria-selected={selecionada}
              onClick={() => aoMudar(aba.valor)}
            >
              {aba.rotulo}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
