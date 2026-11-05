import type { ReactNode } from 'react';
import { classes } from '../utilitarios/classes';

interface Props {
  cabecalho: ReactNode[];
  children: ReactNode;
}

export function Tabela({ cabecalho, children }: Props) {
  return (
    <div className="card">
      <div className="table-responsive">
        <table
          className={classes(
            'table',
            'table-hover',
            'align-middle',
            'mb-0',
          )}
        >
          <thead>
            <tr>
              {cabecalho.map((titulo, i) => (
                <th key={i} scope="col">
                  {titulo}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
