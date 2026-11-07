import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState, type MouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Emprestimo, Paginado, Reserva } from '../api/tipos';
import { Abas, type Aba } from '../componentes/Abas';
import { Avatar } from '../componentes/Avatar';
import { Busca } from '../componentes/Busca';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { ErroCarregamento } from '../componentes/ErroCarregamento';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { Modal } from '../componentes/Modal';
import { Paginacao } from '../componentes/Paginacao';
import { ReservaPainel } from '../componentes/ReservaPainel';
import { SeloStatus } from '../componentes/SeloStatus';
import { Tabela } from '../componentes/Tabela';
import { useToast } from '../componentes/toastContexto';
import { rolarParaDetalhes } from '../selecao';
import { classes } from '../utilitarios/classes';
import { formatarDiaSemana, listarAutores } from '../utilitarios/formatadores';
import { ocultarCpf } from '../utilitarios/mascaras';

const ABAS: Aba[] = [
  { valor: 'ativa', rotulo: 'Ativas' },
  { valor: 'convertida', rotulo: 'Retiradas' },
  { valor: 'expirada', rotulo: 'Expiradas' },
  { valor: 'cancelada', rotulo: 'Canceladas' },
];

const CABECALHO_TABELA = ['Livro', 'Leitor', 'Retirar até', 'Status', ''];

export function Reservas() {
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();
  const toast = useToast();

  const status = params.get('status') ?? 'ativa';
  const q = params.get('q') ?? '';
  const pagina = Number(params.get('page') ?? 1);
  const selecionada = Number(params.get('sel')) || null;

  const [retirando, setRetirando] = useState<Reserva | null>(null);
  const [cancelando, setCancelando] = useState<Reserva | null>(null);

  const filtros: Record<string, string | number> = { status, page: pagina };

  if (q) filtros.q = q;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.reservas.lista(filtros),
    queryFn: () => admin.reservas(filtros),
    placeholderData: keepPreviousData,
  });

  const reservas = data?.data ?? [];
  const reserva = reservas.find((r) => r.id === selecionada) ?? null;

  function mudar(chave: string, valor: string) {
    const novos = new URLSearchParams(params);

    if (valor) novos.set(chave, valor);
    else novos.delete(chave);

    const mudouFiltro = chave !== 'page' && chave !== 'sel';

    if (mudouFiltro) novos.delete('page');

    if (chave === 'status') novos.delete('sel');

    setParams(novos, { replace: true });
  }

  function selecionar(id: number | null) {
    const valor = id
      ? String(id)
      : '';

    mudar('sel', valor);

    if (id) rolarParaDetalhes();
  }

  function aoClicarDetalhes(e: MouseEvent<HTMLButtonElement>, id: number) {
    e.stopPropagation();

    selecionar(id);
  }

  function atualizarListas() {
    qc.invalidateQueries({ queryKey: queryKeys.reservas.todas });
    qc.invalidateQueries({ queryKey: queryKeys.emprestimos.todos });
    qc.invalidateQueries({ queryKey: queryKeys.livros.todos });
  }

  function mostrarErro(erro: unknown) {
    toast.erro(mensagemDeErro(erro));
  }

  const retirar = useMutation({
    mutationFn: (r: Reserva) => admin.retirar(r.id),

    onSuccess: (emprestimo: Emprestimo) => {
      const prazo = formatarDiaSemana(emprestimo.devolver_ate);

      toast.sucesso(`Retirada registrada. Devolver até ${prazo}.`);

      setRetirando(null);

      selecionar(null);

      atualizarListas();
    },

    onError: mostrarErro,
  });

  const cancelar = useMutation({
    mutationFn: (r: Reserva) => admin.cancelarReserva(r.id),

    onSuccess: () => {
      toast.sucesso('Reserva cancelada; exemplar liberado.');

      setCancelando(null);

      selecionar(null);

      atualizarListas();
    },

    onError: mostrarErro,
  });

  function fecharRetirada() {
    setRetirando(null);
  }

  function fecharCancelamento() {
    setCancelando(null);
  }

  function confirmarRetirada() {
    if (retirando) retirar.mutate(retirando);
  }

  function confirmarCancelamento() {
    if (cancelando) cancelar.mutate(cancelando);
  }

  function linha(item: Reserva) {
    const ativa = item.id === selecionada;
    const titulo = item.livro?.titulo ?? '';
    const nomeLeitor = item.leitor?.nome ?? '';

    return (
      <tr
        key={item.id}
        className={classes(ativa && 'table-active')}
        style={{ cursor: 'pointer' }}
        onClick={() => selecionar(item.id)}
      >
        <td>
          <div className="d-flex align-items-center gap-2">
            <Capa mini url={item.livro?.capa_url} titulo={titulo} />

            <div style={{ minWidth: 0 }}>
              <div className="text-truncate">{titulo}</div>

              <div className="small text-body-secondary text-truncate">
                {listarAutores(item.livro?.autores)}
              </div>
            </div>
          </div>
        </td>

        <td>
          <div className="d-flex align-items-center gap-2">
            <Avatar nome={nomeLeitor} url={item.leitor?.foto_url} />

            <div style={{ minWidth: 0 }}>
              <div className="text-truncate">{nomeLeitor}</div>

              <div className="small text-body-secondary font-monospace">
                {ocultarCpf(item.leitor?.cpf)}
              </div>
            </div>
          </div>
        </td>

        <td className="small text-nowrap">
          {formatarDiaSemana(item.expira_em)}
        </td>

        <td>
          <SeloStatus status={item.status} />
        </td>

        <td className="text-end" style={{ width: 48 }}>
          <button
            type="button"
            className="btn btn-sm btn-link text-body"
            aria-label={`Ver detalhes da reserva de ${titulo}`}
            aria-pressed={ativa}
            onClick={(e) => aoClicarDetalhes(e, item.id)}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </td>
      </tr>
    );
  }

  function tabela(resposta: Paginado<Reserva>) {
    return (
      <>
        <Tabela cabecalho={CABECALHO_TABELA}>
          {resposta.data.map(linha)}
        </Tabela>

        <Paginacao
          pagina={resposta.meta.current_page}
          ultima={resposta.meta.last_page}
          aoMudar={(nova) => mudar('page', String(nova))}
        />
      </>
    );
  }

  function tituloVazio(): string {
    if (q) return 'Nenhuma reserva encontrada';

    if (status === 'ativa') return 'Nenhuma reserva aguardando retirada';

    return 'Nada por aqui';
  }

  function lista() {
    if (isLoading) return <Carregando />;

    if (error) return <ErroCarregamento erro={error} aoTentar={refetch} />;

    if (!data || data.data.length === 0) {
      const descricao = (status === 'ativa')
        ? 'Quando um leitor reservar um livro, ele aparece aqui até ser retirado ou a reserva expirar.'
        : undefined;

      return (
        <EstadoVazio
          icone="bookmark"
          titulo={tituloVazio()}
          descricao={descricao}
        />
      );
    }

    return tabela(data);
  }

  function detalhes() {
    if (!reserva) {
      return (
        <EstadoVazio
          icone="bookmark"
          titulo="Nenhuma reserva selecionada"
          descricao="Escolha uma reserva na lista para ver os detalhes e registrar a retirada."
        />
      );
    }

    return (
      <ReservaPainel
        reserva={reserva}
        aoRetirar={() => setRetirando(reserva)}
        aoCancelar={() => setCancelando(reserva)}
        aoFechar={() => selecionar(null)}
      />
    );
  }

  function modalRetirada() {
    const titulo = retirando?.livro?.titulo ?? '';

    return (
      <Modal
        aberto={retirando !== null}
        aoFechar={fecharRetirada}
        titulo="Registrar retirada"
        descricao="A reserva vira empréstimo e o prazo de devolução começa hoje."
        bloqueado={retirar.isPending}
        rodape={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={retirar.isPending}
              onClick={fecharRetirada}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={retirar.isPending}
              onClick={confirmarRetirada}
            >
              {retirar.isPending ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-check2 me-1" aria-hidden="true" />
              )}
              Confirmar retirada
            </button>
          </>
        }
      >
        {retirando && (
          <div className="d-flex gap-3 align-items-center">
            <Capa mini url={retirando.livro?.capa_url} titulo={titulo} />

            <div className="small">
              <div className="fw-semibold">{titulo}</div>

              <div className="text-body-secondary">
                Tombo {retirando.exemplar?.codigo} · para {retirando.leitor?.nome}
              </div>
            </div>
          </div>
        )}
      </Modal>
    );
  }

  function modalCancelamento() {
    const descricao = cancelando
      ? `A reserva de “${cancelando.livro?.titulo}” para ${cancelando.leitor?.nome} `
        + 'será cancelada e o exemplar volta a ficar disponível.'
      : undefined;

    return (
      <Modal
        aberto={cancelando !== null}
        aoFechar={fecharCancelamento}
        titulo="Cancelar reserva"
        descricao={descricao}
        bloqueado={cancelar.isPending}
        rodape={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={cancelar.isPending}
              onClick={fecharCancelamento}
            >
              Manter reserva
            </button>

            <button
              type="button"
              className="btn btn-danger"
              disabled={cancelar.isPending}
              onClick={confirmarCancelamento}
            >
              {cancelar.isPending ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-x-circle me-1" aria-hidden="true" />
              )}
              Cancelar reserva
            </button>
          </>
        }
      />
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Reservas"
        descricao="Fila de retiradas, da reserva mais próxima de vencer."
      />

      <Abas
        abas={ABAS}
        ativa={status}
        aoMudar={(valor) => mudar('status', valor)}
      />

      <div className="mb-3">
        <Busca
          valor={q}
          aoBuscar={(termo) => mudar('q', termo)}
          placeholder="Leitor, CPF ou livro"
        />
      </div>

      <div className="row g-4">
        <section className="col-xl-7">
          {lista()}
        </section>

        <aside
          className="col-xl-5"
          aria-label="Detalhes da reserva"
          data-coluna="detalhes"
        >
          <div
            className="card sticky-xl-top"
            style={{ top: '1.5rem' }}
          >
            <div className="card-body">
              {detalhes()}
            </div>
          </div>
        </aside>
      </div>

      {modalRetirada()}

      {modalCancelamento()}
    </>
  );
}
