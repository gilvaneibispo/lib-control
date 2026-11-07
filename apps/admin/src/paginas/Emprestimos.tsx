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
import type { Emprestimo, Paginado, ResultadoDevolucao } from '../api/tipos';
import { Abas, type Aba } from '../componentes/Abas';
import { Avatar } from '../componentes/Avatar';
import { Busca } from '../componentes/Busca';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { EmprestimoPainel } from '../componentes/EmprestimoPainel';
import { ErroCarregamento } from '../componentes/ErroCarregamento';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { Modal } from '../componentes/Modal';
import { Paginacao } from '../componentes/Paginacao';
import { SeloStatus } from '../componentes/SeloStatus';
import { Tabela } from '../componentes/Tabela';
import { useToast } from '../componentes/toastContexto';
import { rolarParaDetalhes } from '../selecao';
import { classes } from '../utilitarios/classes';
import {
  formatarData,
  formatarDiaSemana,
  listarAutores,
  textoPrazo,
} from '../utilitarios/formatadores';
import { ocultarCpf } from '../utilitarios/mascaras';

const ABAS: Aba[] = [
  { valor: 'ativo', rotulo: 'Ativos' },
  { valor: 'atrasado', rotulo: 'Atrasados' },
  { valor: 'devolvido', rotulo: 'Devolvidos' },
];

const TITULOS_VAZIO: Record<string, string> = {
  ativo: 'Nenhum empréstimo ativo',
  atrasado: 'Nenhum empréstimo atrasado',
  devolvido: 'Nenhuma devolução registrada',
};

function mensagemDevolucao(resultado: ResultadoDevolucao): string {
  const dias = resultado.dias_atraso;

  const unidade = (dias === 1)
    ? 'dia'
    : 'dias';

  const atraso = (dias > 0)
    ? ` Devolvido com ${dias} ${unidade} de atraso.`
    : '';

  const desbloqueio = resultado.leitor_desbloqueado
    ? ' Leitor desbloqueado.'
    : '';

  return `Devolução registrada.${atraso}${desbloqueio}`;
}

export function Emprestimos() {
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();
  const toast = useToast();

  const status = params.get('status') ?? 'ativo';
  const q = params.get('q') ?? '';
  const pagina = Number(params.get('page') ?? 1);
  const selecionado = Number(params.get('sel')) || null;

  const [devolvendo, setDevolvendo] = useState<Emprestimo | null>(null);

  const filtros: Record<string, string | number> = { status, page: pagina };

  if (q) filtros.q = q;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.emprestimos.lista(filtros),
    queryFn: () => admin.emprestimos(filtros),
    placeholderData: keepPreviousData,
  });

  const emprestimos = data?.data ?? [];
  const emprestimo = emprestimos.find((e) => e.id === selecionado) ?? null;

  const devolvidos = status === 'devolvido';

  const rotuloPrazo = devolvidos
    ? 'Devolvido em'
    : 'Devolver até';

  const cabecalhoTabela = ['Livro', 'Leitor', rotuloPrazo, 'Status', ''];

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

  const devolver = useMutation({
    mutationFn: (e: Emprestimo) => admin.devolver(e.id),

    onSuccess: (resultado) => {
      toast.sucesso(mensagemDevolucao(resultado));

      setDevolvendo(null);

      selecionar(null);

      qc.invalidateQueries({ queryKey: queryKeys.emprestimos.todos });
      qc.invalidateQueries({ queryKey: queryKeys.livros.todos });
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  function fecharDevolucao() {
    setDevolvendo(null);
  }

  function confirmarDevolucao() {
    if (devolvendo) devolver.mutate(devolvendo);
  }

  function prazo(item: Emprestimo) {
    if (devolvidos) return formatarData(item.devolvido_em);

    return (
      <>
        {formatarDiaSemana(item.devolver_ate)}

        <div className="small text-body-secondary">
          {textoPrazo(item.dias_restantes)}
        </div>
      </>
    );
  }

  function linha(item: Emprestimo) {
    const ativo = item.id === selecionado;
    const livro = item.exemplar?.livro;
    const titulo = livro?.titulo ?? '';
    const nomeLeitor = item.leitor?.nome ?? '';

    return (
      <tr
        key={item.id}
        className={classes(ativo && 'table-active')}
        style={{ cursor: 'pointer' }}
        onClick={() => selecionar(item.id)}
      >
        <td>
          <div className="d-flex align-items-center gap-2">
            <Capa mini url={livro?.capa_url} titulo={titulo} />

            <div style={{ minWidth: 0 }}>
              <div className="text-truncate">{titulo}</div>

              <div className="small text-body-secondary text-truncate">
                {listarAutores(livro?.autores)}
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
          {prazo(item)}
        </td>

        <td>
          <SeloStatus status={item.status} />
        </td>

        <td className="text-end" style={{ width: 48 }}>
          <button
            type="button"
            className="btn btn-sm btn-link text-body"
            aria-label={`Ver detalhes do empréstimo de ${titulo}`}
            aria-pressed={ativo}
            onClick={(e) => aoClicarDetalhes(e, item.id)}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </td>
      </tr>
    );
  }

  function tabela(resposta: Paginado<Emprestimo>) {
    return (
      <>
        <Tabela cabecalho={cabecalhoTabela}>
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

  function lista() {
    if (isLoading) return <Carregando />;

    if (error) return <ErroCarregamento erro={error} aoTentar={refetch} />;

    if (!data || data.data.length === 0) {
      const icone = (status === 'atrasado')
        ? 'check2-circle'
        : 'arrow-left-right';

      const titulo = q
        ? 'Nenhum empréstimo encontrado'
        : TITULOS_VAZIO[status] ?? 'Nada por aqui';

      return <EstadoVazio icone={icone} titulo={titulo} />;
    }

    return tabela(data);
  }

  function detalhes() {
    if (!emprestimo) {
      return (
        <EstadoVazio
          icone="arrow-left-right"
          titulo="Nenhum empréstimo selecionado"
          descricao="Escolha um empréstimo na lista para ver os detalhes e registrar a devolução."
        />
      );
    }

    return (
      <EmprestimoPainel
        emprestimo={emprestimo}
        aoDevolver={() => setDevolvendo(emprestimo)}
        aoFechar={() => selecionar(null)}
      />
    );
  }

  function modalDevolucao() {
    const atrasado = devolvendo?.status === 'atrasado';

    const descricao = atrasado
      ? `Este empréstimo está com ${textoPrazo(devolvendo.dias_restantes)}.`
      : 'O exemplar volta a ficar disponível.';

    return (
      <Modal
        aberto={devolvendo !== null}
        aoFechar={fecharDevolucao}
        titulo="Registrar devolução"
        descricao={descricao}
        bloqueado={devolver.isPending}
        rodape={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={devolver.isPending}
              onClick={fecharDevolucao}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={devolver.isPending}
              onClick={confirmarDevolucao}
            >
              {devolver.isPending ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-box-arrow-in-left me-1" aria-hidden="true" />
              )}
              Confirmar devolução
            </button>
          </>
        }
      >
        {devolvendo && (
          <div className="small">
            <div className="fw-semibold">
              {devolvendo.exemplar?.livro?.titulo}
            </div>

            <div className="text-body-secondary">
              Tombo {devolvendo.exemplar?.codigo} · {devolvendo.leitor?.nome}
            </div>
          </div>
        )}
      </Modal>
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Empréstimos"
        descricao="Acompanhe prazos e registre devoluções."
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
          placeholder="Leitor, CPF, livro ou tombo"
        />
      </div>

      <div className="row g-4">
        <section className="col-xl-7">
          {lista()}
        </section>

        <aside
          className="col-xl-5"
          aria-label="Detalhes do empréstimo"
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

      {modalDevolucao()}
    </>
  );
}
