import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { leitor } from '../api/servicos';
import type { Reserva, StatusReserva } from '../api/tipos';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { Modal } from '../componentes/Modal';
import { SeloStatus } from '../componentes/SeloStatus';
import { useToast } from '../componentes/toastContexto';
import { useRecarregarSessao } from '../sessao';
import { classes } from '../utilitarios/classes';
import { formatarData, formatarDiaSemana, listarAutores } from '../utilitarios/formatadores';

const SITUACAO_FINAL: Record<StatusReserva, string> = {
  ativa: 'Ativa',
  convertida: 'Retirada',
  expirada: 'Expirou',
  cancelada: 'Cancelada',
};

interface PropsLinha {
  reserva: Reserva;
  aoCancelar: (reserva: Reserva) => void;
}

function LinhaReserva({ reserva, aoCancelar }: PropsLinha) {
  const livro = reserva.livro;
  const ativa = reserva.status === 'ativa';

  function situacao() {
    if (ativa) {
      return (
        <>
          Retire até <strong>{formatarDiaSemana(reserva.expira_em)}</strong>
          {' · '}
          exemplar {reserva.exemplar?.codigo}
        </>
      );
    }

    const texto = SITUACAO_FINAL[reserva.status];
    const data = formatarData(reserva.finalizada_em);

    return (
      <span className="text-body-secondary">
        {texto} em {data}
      </span>
    );
  }

  return (
    <li className="card">
      <div
        className={classes(
          'card-body',
          'd-flex',
          'gap-3',
          'align-items-center',
          'flex-wrap',
          'py-3',
        )}
      >
        <Capa mini url={livro?.capa_url} titulo={livro?.titulo ?? ''} />

        <div className="flex-grow-1" style={{ minWidth: 180 }}>
          <Link to={`/livros/${livro?.id}`} className="fw-semibold link-body-emphasis">
            {livro?.titulo}
          </Link>

          <div className="small text-body-secondary">
            {listarAutores(livro?.autores)}
          </div>

          <div className="small mt-1">
            {situacao()}
          </div>
        </div>

        <SeloStatus status={reserva.status} />

        {ativa && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => aoCancelar(reserva)}
          >
            <i className="bi bi-x-circle me-1" aria-hidden="true" />
            Cancelar
          </button>
        )}
      </div>
    </li>
  );
}

export function MinhasReservas() {
  const toast = useToast();
  const qc = useQueryClient();
  const recarregarSessao = useRecarregarSessao();

  const [cancelando, setCancelando] = useState<Reserva | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.me.reservas,
    queryFn: () => leitor.reservas(),
  });

  const cancelar = useMutation({
    mutationFn: (reserva: Reserva) => leitor.cancelar(reserva.id),

    onSuccess: () => {
      toast.sucesso('Reserva cancelada.');

      setCancelando(null);

      qc.invalidateQueries({ queryKey: queryKeys.me.reservas });
      qc.invalidateQueries({ queryKey: queryKeys.livros.todos });

      recarregarSessao();
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  function fecharModal() {
    setCancelando(null);
  }

  function confirmarCancelamento() {
    if (cancelando) cancelar.mutate(cancelando);
  }

  function conteudo() {
    if (isLoading) return <Carregando />;

    if (error) {
      return (
        <EstadoVazio
          icone="exclamation-triangle"
          titulo="Não foi possível carregar"
          descricao={mensagemDeErro(error)}
          acao={
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => refetch()}
            >
              Tentar novamente
            </button>
          }
        />
      );
    }

    if (!data || data.data.length === 0) {
      return (
        <EstadoVazio
          icone="bookmark"
          titulo="Você ainda não tem reservas"
          descricao="Encontre um livro no catálogo e clique em Reservar."
          acao={
            <Link to="/catalogo" className="btn btn-outline-primary">
              Ir ao catálogo
            </Link>
          }
        />
      );
    }

    return (
      <ul className="list-unstyled d-flex flex-column gap-2 m-0">
        {data.data.map((reserva) => (
          <LinhaReserva key={reserva.id} reserva={reserva} aoCancelar={setCancelando} />
        ))}
      </ul>
    );
  }

  const descricaoModal = cancelando
    ? `O exemplar de “${cancelando.livro?.titulo}” volta a ficar disponível para outros leitores.`
    : undefined;

  return (
    <>
      <CabecalhoPagina
        titulo="Minhas reservas"
        descricao="Retire no balcão da biblioteca até a data indicada."
      />

      {conteudo()}

      <Modal
        aberto={cancelando !== null}
        aoFechar={fecharModal}
        titulo="Cancelar reserva"
        descricao={descricaoModal}
        bloqueado={cancelar.isPending}
        rodape={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={cancelar.isPending}
              onClick={fecharModal}
            >
              Manter reserva
            </button>

            <button
              type="button"
              className="btn btn-danger"
              disabled={cancelar.isPending}
              onClick={confirmarCancelamento}
            >
              {cancelar.isPending && (
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
              )}
              Cancelar reserva
            </button>
          </>
        }
      />
    </>
  );
}
