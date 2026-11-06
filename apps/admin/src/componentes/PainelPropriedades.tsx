import type { ReactNode } from 'react';
import { classes } from '../utilitarios/classes';

export interface Propriedade {
  rotulo: string;
  valor: ReactNode;
}

interface Props {
  midia?: ReactNode;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  propriedades: Propriedade[];
  rodape?: ReactNode;
  aoFechar: () => void;
}

export function PainelPropriedades(props: Props) {
  const {
    midia,
    titulo,
    subtitulo,
    propriedades,
    rodape,
    aoFechar,
  } = props;

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-start gap-3">
        {midia && (
          <div className="flex-shrink-0" style={{ width: 112 }}>
            {midia}
          </div>
        )}

        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <h2 className="h5 fw-semibold mb-1 text-break">{titulo}</h2>

          {subtitulo && (
            <p className="small text-body-secondary mb-0">{subtitulo}</p>
          )}
        </div>

        <button
          type="button"
          className="btn-close flex-shrink-0"
          aria-label="Fechar detalhes"
          onClick={aoFechar}
        />
      </div>

      <dl className="row small m-0 gy-2">
        {propriedades.map((item) => (
          <div key={item.rotulo} className="col-12 d-flex gap-3">
            <dt
              className={classes(
                'text-body-secondary',
                'fw-normal',
                'flex-shrink-0',
              )}
              style={{ width: 110 }}
            >
              {item.rotulo}
            </dt>

            <dd className="m-0">{item.valor}</dd>
          </div>
        ))}
      </dl>

      {rodape && (
        <div
          className={classes(
            'd-flex',
            'flex-wrap',
            'align-items-center',
            'justify-content-end',
            'gap-2',
            'border-top',
            'pt-3',
          )}
        >
          {rodape}
        </div>
      )}
    </div>
  );
}
