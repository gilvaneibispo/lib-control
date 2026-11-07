import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Emprestimo, Reserva } from '../api/tipos';
import { Avatar } from '../componentes/Avatar';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { ErroCarregamento } from '../componentes/ErroCarregamento';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { classes } from '../utilitarios/classes';
import {
  formatarDiaSemana,
  listarAutores,
  textoPrazo,
} from '../utilitarios/formatadores';

const ATUALIZACAO_AUTOMATICA = 60_000;

interface PropsContador {
  titulo: string;
  valor: number;
  icone: string;
  detalhe?: string;
  para: string;
}

function Contador({ titulo, valor, icone, detalhe, para }: PropsContador) {
  return (
    <Link
      to={para}
      className={classes(
        'card',
        'card-numero',
        'h-100',
        'text-decoration-none',
      )}
    >
      <i
        className={classes(
          'bi',
          `bi-${icone}`,
          'card-numero-icone',
        )}
        aria-hidden="true"
      />

      <div
        className={classes(
          'card-body',
          'd-flex',
          'flex-column',
          'gap-2',
        )}
      >
        <div className="small text-body-secondary">{titulo}</div>

        <div className="fs-2 fw-semibold text-body">{valor}</div>

        {detalhe && (
          <div className="small text-body-secondary">{detalhe}</div>
        )}
      </div>
    </Link>
  );
}

interface PropsCartao {
  titulo: string;
  descricao: string;
  children: ReactNode;
}

function Cartao({ titulo, descricao, children }: PropsCartao) {
  return (
    <div className="card h-100">
      <div className="card-header bg-transparent">
        <h2 className="h6 fw-semibold mb-1">{titulo}</h2>

        <p className="small text-body-secondary mb-0">{descricao}</p>
      </div>

      <div className="card-body">{children}</div>
    </div>
  );
}

function textoVencemHoje(quantidade: number): string {
  if (quantidade === 1) return '1 vence hoje';

  return `${quantidade} vencem hoje`;
}

function itemRetirada(reserva: Reserva) {
  const titulo = reserva.livro?.titulo ?? '';

  return (
    <li key={reserva.id} className="d-flex align-items-center gap-2">
      <Capa mini url={reserva.livro?.capa_url} titulo={titulo} />

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="text-truncate">{titulo}</div>

        <div className="small text-body-secondary text-truncate">
          {reserva.leitor?.nome} · tombo {reserva.exemplar?.codigo}
        </div>
      </div>

      <span className="small text-body-secondary text-nowrap">
        até {formatarDiaSemana(reserva.expira_em)}
      </span>
    </li>
  );
}

function itemAtrasado(emprestimo: Emprestimo) {
  const nomeLeitor = emprestimo.leitor?.nome ?? '';
  const livro = emprestimo.exemplar?.livro;

  return (
    <li key={emprestimo.id} className="d-flex align-items-center gap-2">
      <Avatar nome={nomeLeitor} url={emprestimo.leitor?.foto_url} />

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="text-truncate">{nomeLeitor}</div>

        <div className="small text-body-secondary text-truncate">
          {livro?.titulo} · {listarAutores(livro?.autores)}
        </div>
      </div>

      <span className="badge rounded-pill text-bg-danger">
        {textoPrazo(emprestimo.dias_restantes)}
      </span>
    </li>
  );
}

function retiradasPendentes(reservas: Reserva[]) {
  if (reservas.length === 0) {
    return (
      <EstadoVazio
        icone="bookmark"
        titulo="Nenhuma retirada pendente"
      />
    );
  }

  return (
    <ul
      className={classes(
        'list-unstyled',
        'm-0',
        'd-flex',
        'flex-column',
        'gap-2',
      )}
    >
      {reservas.map(itemRetirada)}
    </ul>
  );
}

function atrasados(emprestimos: Emprestimo[]) {
  if (emprestimos.length === 0) {
    return (
      <EstadoVazio
        icone="check2-circle"
        titulo="Nenhum empréstimo atrasado"
      />
    );
  }

  return (
    <ul
      className={classes(
        'list-unstyled',
        'm-0',
        'd-flex',
        'flex-column',
        'gap-2',
      )}
    >
      {emprestimos.map(itemAtrasado)}
    </ul>
  );
}

export function Painel() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.painel,
    queryFn: admin.painel,
    refetchInterval: ATUALIZACAO_AUTOMATICA,
  });

  if (isLoading) return <Carregando />;

  if (error || !data) return <ErroCarregamento erro={error} aoTentar={refetch} />;

  const contadores = data.contadores;

  return (
    <>
      <CabecalhoPagina
        titulo="Painel"
        descricao="Visão do dia: retiradas, empréstimos e pendências."
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <Contador
            titulo="Reservas a retirar"
            valor={contadores.reservas_a_retirar}
            icone="bookmark"
            detalhe={textoVencemHoje(contadores.reservas_vencem_hoje)}
            para="/reservas"
          />
        </div>

        <div className="col-6 col-xl-3">
          <Contador
            titulo="Empréstimos ativos"
            valor={contadores.emprestimos_ativos}
            icone="arrow-left-right"
            para="/emprestimos"
          />
        </div>

        <div className="col-6 col-xl-3">
          <Contador
            titulo="Atrasados"
            valor={contadores.emprestimos_atrasados}
            icone="exclamation-circle"
            para="/emprestimos?status=atrasado"
          />
        </div>

        <div className="col-6 col-xl-3">
          <Contador
            titulo="Leitores bloqueados"
            valor={contadores.leitores_bloqueados}
            icone="slash-circle"
            para="/leitores?bloqueado=1"
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-6">
          <Cartao
            titulo="Retiradas pendentes"
            descricao="Reservas ativas, da mais próxima de vencer."
          >
            {retiradasPendentes(data.retiradas_pendentes)}
          </Cartao>
        </div>

        <div className="col-xl-6">
          <Cartao
            titulo="Atrasados"
            descricao="Empréstimos que passaram do prazo."
          >
            {atrasados(data.atrasados)}
          </Cartao>
        </div>
      </div>
    </>
  );
}
