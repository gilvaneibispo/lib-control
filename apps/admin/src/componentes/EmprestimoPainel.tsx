import type { Emprestimo } from '../api/tipos';
import {
  formatarData,
  formatarDataHora,
  formatarDiaSemana,
  listarAutores,
  textoPrazo,
} from '../utilitarios/formatadores';
import { Capa } from './Capa';
import { LeitorResumo } from './LeitorResumo';
import { PainelPropriedades, type Propriedade } from './PainelPropriedades';
import { SeloStatus } from './SeloStatus';

interface Props {
  emprestimo: Emprestimo;
  aoDevolver: () => void;
  aoFechar: () => void;
}

function prazo(emprestimo: Emprestimo) {
  const diaSemana = formatarDiaSemana(emprestimo.devolver_ate);
  const data = formatarData(emprestimo.devolver_ate);

  const devolvido = emprestimo.status === 'devolvido';
  const atrasado = emprestimo.status === 'atrasado';

  const corPrazo = atrasado
    ? 'text-danger'
    : 'text-body-secondary';

  return (
    <>
      {diaSemana} · {data}

      {!devolvido && (
        <span className={`d-block small ${corPrazo}`}>
          {textoPrazo(emprestimo.dias_restantes)}
        </span>
      )}
    </>
  );
}

function propriedadesDaDevolucao(emprestimo: Emprestimo): Propriedade[] {
  const lista: Propriedade[] = [
    {
      rotulo: 'Devolvido em',
      valor: formatarDataHora(emprestimo.devolvido_em),
    },
  ];

  if (emprestimo.recebido_por) {
    lista.push({
      rotulo: 'Recebido por',
      valor: emprestimo.recebido_por,
    });
  }

  if (emprestimo.dias_atraso > 0) {
    lista.push({
      rotulo: 'Atraso',
      valor: (
        <span className="text-danger">
          {emprestimo.dias_atraso} dia(s)
        </span>
      ),
    });
  }

  return lista;
}

function propriedades(emprestimo: Emprestimo): Propriedade[] {
  const origem = (emprestimo.origem === 'reserva')
    ? 'Retirada de reserva'
    : 'Empréstimo de balcão';

  const lista: Propriedade[] = [
    {
      rotulo: 'Status',
      valor: <SeloStatus status={emprestimo.status} />,
    },
    {
      rotulo: 'Leitor',
      valor: <LeitorResumo leitor={emprestimo.leitor} />,
    },
    {
      rotulo: 'Tombo',
      valor: (
        <span className="font-monospace">
          {emprestimo.exemplar?.codigo ?? '—'}
        </span>
      ),
    },
    {
      rotulo: 'Origem',
      valor: origem,
    },
    {
      rotulo: 'Emprestado em',
      valor: formatarDataHora(emprestimo.emprestado_em),
    },
  ];

  if (emprestimo.emprestado_por) {
    lista.push({
      rotulo: 'Emprestado por',
      valor: emprestimo.emprestado_por,
    });
  }

  lista.push({
    rotulo: 'Devolver até',
    valor: prazo(emprestimo),
  });

  if (emprestimo.devolvido_em) {
    const devolucao = propriedadesDaDevolucao(emprestimo);

    lista.push(...devolucao);
  }

  return lista;
}

export function EmprestimoPainel({ emprestimo, aoDevolver, aoFechar }: Props) {
  const livro = emprestimo.exemplar?.livro;
  const titulo = livro?.titulo ?? '';

  const rodape = (emprestimo.status !== 'devolvido') && (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={aoDevolver}
    >
      <i className="bi bi-box-arrow-in-left me-1" aria-hidden="true" />
      Registrar devolução
    </button>
  );

  return (
    <PainelPropriedades
      midia={<Capa url={livro?.capa_url} titulo={titulo} />}
      titulo={titulo}
      subtitulo={listarAutores(livro?.autores)}
      propriedades={propriedades(emprestimo)}
      rodape={rodape}
      aoFechar={aoFechar}
    />
  );
}
