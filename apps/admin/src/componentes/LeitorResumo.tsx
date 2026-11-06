import type { LeitorResumo as Leitor } from '../api/tipos';
import { ocultarCpf } from '../utilitarios/mascaras';
import { Avatar } from './Avatar';
import { SeloStatus } from './SeloStatus';

export function LeitorResumo({ leitor }: { leitor?: Leitor }) {
  if (!leitor) return <>—</>;

  return (
    <span className="d-flex align-items-center gap-2">
      <Avatar nome={leitor.nome} url={leitor.foto_url} />

      <span style={{ minWidth: 0 }}>
        {leitor.nome}

        <span className="d-block small text-body-secondary font-monospace">
          {ocultarCpf(leitor.cpf)}
        </span>
      </span>

      {leitor.bloqueado && <SeloStatus status="bloqueado" />}
    </span>
  );
}
