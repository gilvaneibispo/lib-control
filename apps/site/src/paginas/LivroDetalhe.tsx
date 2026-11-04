import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MENSAGENS_ERRO, mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { catalogo, leitor } from '../api/servicos';
import type { Elegibilidade, Livro, Reserva } from '../api/tipos';
import { Alerta } from '../componentes/Alerta';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { Modal } from '../componentes/Modal';
import { SeloStatus } from '../componentes/SeloStatus';
import { useToast } from '../componentes/toastContexto';
import { useRecarregarSessao, useSessao } from '../sessao';
import { classes } from '../utilitarios/classes';
import { formatarDiaSemana, listarAutores } from '../utilitarios/formatadores';

const CODIGOS_GRAVES = ['LEITOR_BLOQUEADO', 'EMPRESTIMO_ATRASADO'];

function motivoParaNaoReservar(
  logado: boolean,
  elegibilidade: Elegibilidade | null | undefined,
  disponiveis: number | undefined,
): string | null {
  if (!logado) return null;

  if (elegibilidade && !elegibilidade.elegivel) {
    if (elegibilidade.codigo) return MENSAGENS_ERRO[elegibilidade.codigo];

    return elegibilidade.mensagem;
  }

  if (disponiveis === 0) return MENSAGENS_ERRO.SEM_EXEMPLAR_DISPONIVEL;

  return null;
}

function Ficha({ livro }: { livro: Livro }) {
  const temClassificacao = Boolean(livro.cdd || livro.cdu);

  return (
    <dl className="row small m-0 gy-2" style={{ maxWidth: 640 }}>
      {livro.editora && (
        <>
          <dt className="col-4 text-body-secondary fw-normal">Editora</dt>
          <dd className="col-8 m-0">{livro.editora}</dd>
        </>
      )}

      {livro.ano && (
        <>
          <dt className="col-4 text-body-secondary fw-normal">Ano</dt>
          <dd className="col-8 m-0">{livro.ano}</dd>
        </>
      )}

      {livro.isbn && (
        <>
          <dt className="col-4 text-body-secondary fw-normal">ISBN</dt>
          <dd className="col-8 m-0 font-monospace">{livro.isbn}</dd>
        </>
      )}

      {temClassificacao && (
        <>
          <dt className="col-4 text-body-secondary fw-normal">Classificação</dt>

          <dd className="col-8 m-0">
            {livro.cdd && <span className="font-monospace me-3">CDD {livro.cdd}</span>}

            {livro.cdu && <span className="font-monospace">CDU {livro.cdu}</span>}
          </dd>
        </>
      )}

      {livro.area && (
        <>
          <dt className="col-4 text-body-secondary fw-normal">Área</dt>

          <dd className="col-8 m-0">
            {livro.area.nome}
            {livro.subarea && ` › ${livro.subarea.nome}`}
          </dd>
        </>
      )}
    </dl>
  );
}

export function LivroDetalhe() {
  const parametros = useParams();
  const id = Number(parametros.id);

  const { data: sessao } = useSessao();
  const navegar = useNavigate();
  const toast = useToast();
  const qc = useQueryClient();
  const recarregarSessao = useRecarregarSessao();

  const [reserva, setReserva] = useState<Reserva | null>(null);

  const idUsuario = sessao?.data.id ?? 0;

  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKeys.livros.detalhe(id), idUsuario],
    queryFn: () => catalogo.livro(id),
  });

  const reservar = useMutation({
    mutationFn: () => leitor.reservar(id),

    onSuccess: (nova) => {
      setReserva(nova);

      qc.invalidateQueries({ queryKey: queryKeys.livros.todos });
      qc.invalidateQueries({ queryKey: queryKeys.me.reservas });

      recarregarSessao();
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  if (isLoading) return <Carregando />;

  if (error || !data) {
    return (
      <EstadoVazio
        icone="book"
        titulo="Livro não encontrado"
        descricao={mensagemDeErro(error)}
        acao={<Link to="/catalogo">Voltar ao catálogo</Link>}
      />
    );
  }

  const livro = data.data;
  const elegibilidade = data.elegibilidade;
  const disponiveis = livro.exemplares_disponiveis;

  const motivo = motivoParaNaoReservar(Boolean(sessao), elegibilidade, disponiveis);

  const codigoElegibilidade = elegibilidade?.codigo ?? '';
  const motivoGrave = CODIGOS_GRAVES.includes(codigoElegibilidade);

  const tomAlerta = motivoGrave
    ? 'danger'
    : 'info';

  function irParaLogin() {
    const origem = { de: `/livros/${id}` };

    navegar('/entrar', { state: origem });
  }

  function fecharConfirmacao() {
    setReserva(null);
  }

  function botaoReservar() {
    if (!sessao) {
      return (
        <button type="button" className="btn btn-primary btn-lg" onClick={irParaLogin}>
          <i className="bi bi-bookmark me-2" aria-hidden="true" />
          Entre para reservar
        </button>
      );
    }

    const desabilitado = Boolean(motivo) || reservar.isPending;

    return (
      <>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={desabilitado}
          onClick={() => reservar.mutate()}
        >
          {reservar.isPending ? (
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          ) : (
            <i className="bi bi-bookmark me-2" aria-hidden="true" />
          )}
          Reservar
        </button>

        {motivo && <Alerta tom={tomAlerta}>{motivo}</Alerta>}
      </>
    );
  }

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/catalogo">Catálogo</Link>
          </li>

          {livro.area && (
            <li className="breadcrumb-item">
              <Link to={`/catalogo?area=${livro.area.id}`}>{livro.area.nome}</Link>
            </li>
          )}

          {livro.subarea && (
            <li className="breadcrumb-item">
              <Link to={`/catalogo?subarea=${livro.subarea.id}`}>{livro.subarea.nome}</Link>
            </li>
          )}
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-sm-5 col-md-4 col-lg-3">
          <Capa url={livro.capa_url} titulo={livro.titulo} />
        </div>

        <div
          className={classes(
            'col-sm-7',
            'col-md-8',
            'col-lg-9',
            'd-flex',
            'flex-column',
            'gap-3',
          )}
        >
          <div>
            <h1 className="h2 fw-semibold mb-1">{livro.titulo}</h1>

            {livro.subtitulo && (
              <p className="fs-5 text-body-secondary mb-1">{livro.subtitulo}</p>
            )}

            <p className="m-0">{listarAutores(livro.autores)}</p>
          </div>

          {disponiveis !== undefined && (
            <div className="d-flex flex-wrap align-items-center gap-2">
              <SeloStatus status={disponiveis > 0 ? 'disponivel' : 'indisponivel'} />

              <span className="small text-body-secondary">
                {disponiveis} de {livro.exemplares_total} exemplar(es) disponível(is)
              </span>
            </div>
          )}

          <div className="d-flex flex-column gap-2" style={{ maxWidth: 440 }}>
            {botaoReservar()}
          </div>

          <Ficha livro={livro} />

          {livro.sinopse && (
            <div style={{ maxWidth: 720 }}>
              <h2 className="h5 fw-semibold">Sinopse</h2>

              <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {livro.sinopse}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        aberto={reserva !== null}
        aoFechar={fecharConfirmacao}
        titulo="Reserva confirmada"
        descricao="Apresente-se no balcão da biblioteca com um documento para retirar."
        rodape={
          <>
            <button type="button" className="btn btn-secondary" onClick={fecharConfirmacao}>
              Continuar no catálogo
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navegar('/minhas-reservas')}
            >
              Ver minhas reservas
            </button>
          </>
        }
      >
        {reserva && (
          <div className="d-flex gap-3 align-items-center">
            <i className="bi bi-bookmark-check fs-2 text-success" aria-hidden="true" />

            <div>
              <div className="fw-semibold">{livro.titulo}</div>

              <div className="small">
                Retire até <strong>{formatarDiaSemana(reserva.expira_em)}</strong>
                {' · '}
                exemplar {reserva.exemplar?.codigo}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
