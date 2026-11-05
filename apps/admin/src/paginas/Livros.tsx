import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MouseEvent } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Livro, Paginado } from '../api/tipos';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { ErroCarregamento } from '../componentes/ErroCarregamento';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { LivroPainel } from '../componentes/LivroPainel';
import { Paginacao } from '../componentes/Paginacao';
import { Tabela } from '../componentes/Tabela';
import { rolarParaDetalhes } from '../selecao';
import { classes } from '../utilitarios/classes';
import { listarAutores } from '../utilitarios/formatadores';

const CABECALHO_TABELA = ['', 'Título', 'Área', 'Disponíveis', ''];

function textoDisponiveis(livro: Livro): string {
  const total = livro.exemplares_total;
  const disponiveis = livro.exemplares_disponiveis;

  if (total === undefined || disponiveis === undefined)
    return '—';

  if (disponiveis === 0)
    return 'Nenhum';

  if (disponiveis === total)
    return 'Todos';

  return `${disponiveis} de ${total}`;
}

export function Livros() {
  const [params, setParams] = useSearchParams();
  const navegar = useNavigate();
  const local = useLocation();

  const pagina = Number(params.get('page') ?? 1);
  const selecionado = Number(params.get('sel')) || null;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.livros.lista({ page: pagina }),
    queryFn: () => admin.livros(pagina),
    placeholderData: keepPreviousData,
  });

  function mudar(chave: string, valor: string) {
    const novos = new URLSearchParams(params);

    if (valor) novos.set(chave, valor);
    else novos.delete(chave);

    setParams(novos, { replace: true });
  }

  function selecionar(id: number | null) {
    const valor = id
      ? String(id)
      : '';

    mudar('sel', valor);

    if (id) rolarParaDetalhes();
  }

  function abrirCadastro() {
    navegar({ pathname: '/livros/novo', search: local.search });
  }

  function aoClicarDetalhes(e: MouseEvent<HTMLButtonElement>, id: number) {
    e.stopPropagation();

    selecionar(id);
  }

  function linha(livro: Livro) {
    const ativo = livro.id === selecionado;

    return (
      <tr
        key={livro.id}
        className={classes(ativo && 'table-active')}
        style={{ cursor: 'pointer' }}
        onClick={() => selecionar(livro.id)}
      >
        <td style={{ width: 48 }}>
          <Capa mini url={livro.capa_url} titulo={livro.titulo} />
        </td>

        <td>
          <div>{livro.titulo}</div>

          <div className="small text-body-secondary">
            {listarAutores(livro.autores)}
          </div>
        </td>

        <td className="small">
          {livro.area?.nome ?? <span className="text-body-secondary">—</span>}
        </td>

        <td className="small text-nowrap">
          {textoDisponiveis(livro)}
        </td>

        <td className="text-end" style={{ width: 48 }}>
          <button
            type="button"
            className="btn btn-sm btn-link text-body"
            aria-label={`Ver detalhes de ${livro.titulo}`}
            aria-pressed={ativo}
            onClick={(e) => aoClicarDetalhes(e, livro.id)}
          >
            <i className="bi bi-chevron-right" aria-hidden="true" />
          </button>
        </td>
      </tr>
    );
  }

  function tabela(resposta: Paginado<Livro>) {
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
      return (
        <EstadoVazio
          icone="book"
          titulo="Nenhum livro cadastrado"
          descricao="Cadastre o primeiro livro do acervo."
        />
      );
    }

    return tabela(data);
  }

  function detalhes() {
    if (!selecionado) {
      return (
        <EstadoVazio
          icone="book"
          titulo="Nenhum livro selecionado"
          descricao="Escolha um livro na lista para ver os detalhes e gerenciar os exemplares."
        />
      );
    }

    return (
      <LivroPainel
        key={selecionado}
        livroId={selecionado}
        aoExcluir={() => selecionar(null)}
        aoFechar={() => selecionar(null)}
      />
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Livros"
        descricao="Acervo cadastrado, com os exemplares de cada livro."
        acoes={
          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirCadastro}
          >
            <i className="bi bi-plus-lg me-1" aria-hidden="true" />
            Novo livro
          </button>
        }
      />

      <div className="row g-4">
        <section className="col-xl-7">
          {lista()}
        </section>

        <aside
          className="col-xl-5"
          aria-label="Detalhes do livro"
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

      <Outlet />
    </>
  );
}
