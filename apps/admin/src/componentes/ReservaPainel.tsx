import type { Reserva, StatusReserva } from '../api/tipos';
import {
  formatarData,
  formatarDataHora,
  formatarDiaSemana,
  listarAutores,
} from '../utilitarios/formatadores';
import { Capa } from './Capa';
import { LeitorResumo } from './LeitorResumo';
import { PainelPropriedades, type Propriedade } from './PainelPropriedades';
import { SeloStatus } from './SeloStatus';

interface Props {
  reserva: Reserva;
  aoRetirar: () => void;
  aoCancelar: () => void;
  aoFechar: () => void;
}

const ROTULO_FINALIZACAO: Partial<Record<StatusReserva, string>> = {
  convertida: 'Retirada em',
  expirada: 'Expirou em',
  cancelada: 'Cancelada em',
};

function propriedades(reserva: Reserva): Propriedade[] {
  const diaSemana = formatarDiaSemana(reserva.expira_em);
  const data = formatarData(reserva.expira_em);

  const lista: Propriedade[] = [
    {
      rotulo: 'Status',
      valor: <SeloStatus status={reserva.status} />,
    },
    {
      rotulo: 'Leitor',
      valor: <LeitorResumo leitor={reserva.leitor} />,
    },
    {
      rotulo: 'Tombo',
      valor: (
        <span className="font-monospace">
          {reserva.exemplar?.codigo ?? '—'}
        </span>
      ),
    },
    {
      rotulo: 'Reservada em',
      valor: formatarDataHora(reserva.criada_em),
    },
    {
      rotulo: 'Retirar até',
      valor: `${diaSemana} · ${data}`,
    },
  ];

  const rotuloFinalizacao = ROTULO_FINALIZACAO[reserva.status];

  if (rotuloFinalizacao) {
    lista.push({
      rotulo: rotuloFinalizacao,
      valor: formatarDataHora(reserva.finalizada_em),
    });
  }

  const isbn = reserva.livro?.isbn;

  if (isbn) {
    lista.push({
      rotulo: 'ISBN',
      valor: <span className="font-monospace">{isbn}</span>,
    });
  }

  return lista;
}

export function ReservaPainel({ reserva, aoRetirar, aoCancelar, aoFechar }: Props) {
  const livro = reserva.livro;
  const titulo = livro?.titulo ?? '';

  const rodape = (reserva.status === 'ativa') && (
    <>
      <button
        type="button"
        className="btn btn-danger"
        onClick={aoCancelar}
      >
        <i className="bi bi-x-circle me-1" aria-hidden="true" />
        Cancelar reserva
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={aoRetirar}
      >
        <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
        Registrar retirada
      </button>
    </>
  );

  return (
    <PainelPropriedades
      midia={<Capa url={livro?.capa_url} titulo={titulo} />}
      titulo={titulo}
      subtitulo={listarAutores(livro?.autores)}
      propriedades={propriedades(reserva)}
      rodape={rodape}
      aoFechar={aoFechar}
    />
  );
}
