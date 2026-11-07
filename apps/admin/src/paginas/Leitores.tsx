import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Leitor, Paginado } from '../api/tipos';
import { Avatar } from '../componentes/Avatar';
import { Busca } from '../componentes/Busca';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Carregando } from '../componentes/Carregando';
import { ErroCarregamento } from '../componentes/ErroCarregamento';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { LeitorPainel } from '../componentes/LeitorPainel';
import { Paginacao } from '../componentes/Paginacao';
import { SeloStatus } from '../componentes/SeloStatus';
import { Tabela } from '../componentes/Tabela';
import { rolarParaDetalhes } from '../selecao';
import { classes } from '../utilitarios/classes';
import { ocultarCpf } from '../utilitarios/mascaras';

const CABECALHO_TABELA = ['Leitor', 'CPF', 'Itens em uso', 'Situação', ''];

function itensEmUso(leitor: Leitor): number {
  const reservas = leitor.reservas_ativas_count ?? 0;
  const emprestimos = leitor.emprestimos_nao_devolvidos_count ?? 0;

  return reservas + emprestimos;
}

export function Leitores() {
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const bloqueado = params.get('bloqueado') === '1';
  const pagina = Number(params.get('page') ?? 1);
  const selecionado = Number(params.get('sel')) || null;

  const filtros: Record<string, string | number> = {
    papel: 'leitor',
    page: pagina,
  };

  if (q) filtros.q = q;

  if (bloqueado) filtros.bloqueado = 1;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.leitores.lista(filtros),
    queryFn: () => admin.usuarios(filtros),
    placeholderData: keepPreviousData,
  });

  const filtrando = Boolean(q) || bloqueado;

  function mudar(chave: string, valor: string) {
    const novos = new URLSearchParams(params);

    if (valor) novos.set(chave, valor);
    else novos.delete(chave);

    const mudouFiltro = chave !== 'page' && chave !== 'sel';

    if (mudouFiltro) novos.delete('page');

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

  function aoMudarBloqueado(marcado: boolean) {
    const valor = marcado
      ? '1'
      : '';

    mudar('bloqueado', valor);
  }

  function linha(item: Leitor) {
    const ativo = item.id === selecionado;

    const situacao = item.bloqueado
      ? 'bloqueado'
      : 'regular';

    return (
      <tr
        key={item.id}
        className={classes(ativo && 'table-active')}
        style={{ cursor: 'pointer' }}
        onClick={() => selecionar(item.id)}
      >
        <td>
          <div className="d-flex align-items-center gap-2">
            <Avatar nome={item.nome} url={item.foto_url} />

            <div style={{ minWidth: 0 }}>
              <div className="text-truncate">{item.nome}</div>

              <div className="small text-body-secondary text-truncate">
                {item.email}
              </div>
            </div>
          </div>
        </td>

        <td className="small font-monospace">
          {ocultarCpf(item.cpf)}
        </td>

        <td className="small">
          {itensEmUso(item)}
        </td>

        <td>
          <SeloStatus status={situacao} />
        </td>

        <td className="text-end" style={{ width: 48 }}>
          <button
            type="button"
            className="btn btn-sm btn-link text-body"
            aria-label={`Ver detalhes de ${item.nome}`}
            aria-pressed={ativo}
            onClick={(e) => aoClicarDetalhes(e, item.id)}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </td>
      </tr>
    );
  }

  function tabela(resposta: Paginado<Leitor>) {
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

  function lista() {
    if (isLoading) return <Carregando />;

    if (error) return <ErroCarregamento erro={error} aoTentar={refetch} />;

    if (!data || data.data.length === 0) {
      const titulo = filtrando
        ? 'Nenhum leitor encontrado'
        : 'Nenhum leitor cadastrado';

      const descricao = filtrando
        ? 'Ajuste a busca ou o filtro.'
        : 'Leitores se cadastram pelo catálogo público.';

      return (
        <EstadoVazio
          icone="person"
          titulo={titulo}
          descricao={descricao}
        />
      );
    }

    return tabela(data);
  }

  function detalhes() {
    if (!selecionado) {
      return (
        <EstadoVazio
          icone="person"
          titulo="Nenhum leitor selecionado"
          descricao="Escolha um leitor na lista para ver dados, elegibilidade, histórico e bloqueio."
        />
      );
    }

    return (
      <LeitorPainel
        key={selecionado}
        id={selecionado}
        aoFechar={() => selecionar(null)}
      />
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Leitores"
        descricao="Cadastros, situação e histórico de cada leitor."
      />

      <div
        className={classes(
          'd-flex',
          'flex-wrap',
          'align-items-center',
          'gap-3',
          'mb-3',
        )}
      >
        <Busca
          valor={q}
          aoBuscar={(termo) => mudar('q', termo)}
          placeholder="Nome, e-mail ou CPF"
        />

        <div className="form-check m-0">
          <input
            id="somente-bloqueados"
            type="checkbox"
            className="form-check-input"
            checked={bloqueado}
            onChange={(e) => aoMudarBloqueado(e.target.checked)}
          />

          <label
            htmlFor="somente-bloqueados"
            className="form-check-label small"
          >
            Só bloqueados
          </label>
        </div>
      </div>

      <div className="row g-4">
        <section className="col-xl-7">
          {lista()}
        </section>

        <aside
          className="col-xl-5"
          aria-label="Detalhes do leitor"
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
    </>
  );
}
