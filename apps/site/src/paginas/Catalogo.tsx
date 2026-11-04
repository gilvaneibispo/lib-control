import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '../api/queryKeys';
import { catalogo } from '../api/servicos';
import type { Area } from '../api/tipos';
import { CardLivro } from '../componentes/CardLivro';
import { Carregando } from '../componentes/Carregando';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { FiltroAreas } from '../componentes/FiltroAreas';
import { Paginacao } from '../componentes/Paginacao';
import {
  alternarArea,
  alternarSubarea,
  escreverIds,
  lerIds,
  totalSelecionado,
  type SelecaoAreas,
} from '../filtroAreas';
import { classes } from '../utilitarios/classes';

interface FiltroAtivo {
  chave: string;
  rotulo: string;
  remover: () => void;
}

const CINCO_MINUTOS = 5 * 60_000;

export function Catalogo() {
  const [params, setParams] = useSearchParams();

  const q = params.get('q') ?? '';
  const area = params.get('area') ?? '';
  const subarea = params.get('subarea') ?? '';
  const disponivel = params.get('disponivel') === '1';
  const ordem = params.get('ordem') ?? 'titulo';
  const pagina = Number(params.get('page') ?? 1);

  const selecao = useMemo<SelecaoAreas>(() => {
    return {
      areas: lerIds(area),
      subareas: lerIds(subarea),
    };
  }, [area, subarea]);

  const filtros = { q, area, subarea, disponivel, ordem, page: pagina };

  const livros = useQuery({
    queryKey: queryKeys.livros.lista(filtros),
    queryFn: () => catalogo.livros(filtros),
    placeholderData: keepPreviousData,
  });

  const { data: areas = [] } = useQuery({
    queryKey: queryKeys.areas,
    queryFn: catalogo.areas,
    staleTime: CINCO_MINUTOS,
  });

  function mudar(valores: Record<string, string>) {
    setParams(
      (atual) => {
        const novos = new URLSearchParams(atual);

        for (const [chave, valor] of Object.entries(valores)) {
          if (valor) novos.set(chave, valor);
          else novos.delete(chave);
        }

        if (!('page' in valores)) novos.delete('page');

        return novos;
      },
      { replace: true },
    );
  }

  function mudarSelecao(nova: SelecaoAreas) {
    const areasSelecionadas = escreverIds(nova.areas);
    const subareasSelecionadas = escreverIds(nova.subareas);

    mudar({ area: areasSelecionadas, subarea: subareasSelecionadas });
  }

  function limparFiltros() {
    setParams({}, { replace: true });
  }

  function aoMarcarDisponivel(e: ChangeEvent<HTMLInputElement>) {
    const valor = e.target.checked
      ? '1'
      : '';

    mudar({ disponivel: valor });
  }

  function aoMudarOrdem(e: ChangeEvent<HTMLSelectElement>) {
    const escolhida = e.target.value;

    const valor = (escolhida === 'titulo')
      ? ''
      : escolhida;

    mudar({ ordem: valor });
  }

  function aoMudarPagina(nova: number) {
    mudar({ page: String(nova) });
  }

  function filtrosDeArea(): FiltroAtivo[] {
    const ativos: FiltroAtivo[] = [];

    for (const id of selecao.areas) {
      const encontrada = areas.find((a) => a.id === id);

      if (!encontrada) continue;

      ativos.push({
        chave: `a${id}`,
        rotulo: encontrada.nome,
        remover: () => {
          const nova = alternarArea(selecao, encontrada);

          mudarSelecao(nova);
        },
      });
    }

    return ativos;
  }

  function filtrosDeSubarea(areaAtual: Area): FiltroAtivo[] {
    const subareas = areaAtual.subareas ?? [];
    const marcadas = subareas.filter((sub) => selecao.subareas.includes(sub.id));

    if (marcadas.length > 2) {
      const ids = marcadas.map((sub) => sub.id);

      const agrupado: FiltroAtivo = {
        chave: `g${areaAtual.id}`,
        rotulo: `${areaAtual.nome} › ${marcadas.length} sub-áreas`,
        remover: () => {
          const restantes = selecao.subareas.filter((id) => !ids.includes(id));

          mudarSelecao({ ...selecao, subareas: restantes });
        },
      };

      return [agrupado];
    }

    return marcadas.map((sub) => ({
      chave: `s${sub.id}`,
      rotulo: `${areaAtual.nome} › ${sub.nome}`,
      remover: () => {
        const nova = alternarSubarea(selecao, areaAtual, sub.id);

        mudarSelecao(nova);
      },
    }));
  }

  const ativos = [
    ...filtrosDeArea(),
    ...areas.flatMap(filtrosDeSubarea),
  ];

  const temAreasSelecionadas = totalSelecionado(selecao) > 0;
  const filtrando = q !== '' || disponivel || temAreasSelecionadas;
  const mostrarFiltrosAtivos = ativos.length > 0 || filtrando;

  function resultados() {
    if (livros.isLoading) return <Carregando />;

    if (livros.error) {
      return (
        <EstadoVazio
          icone="exclamation-triangle"
          titulo="Não foi possível carregar o acervo"
          acao={
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => livros.refetch()}
            >
              Tentar novamente
            </button>
          }
        />
      );
    }

    const resposta = livros.data;

    if (!resposta || resposta.data.length === 0) {
      const titulo = filtrando
        ? 'Nenhum livro encontrado'
        : 'O acervo ainda está vazio';

      const descricao = filtrando
        ? 'Tente outro termo ou remova filtros.'
        : 'Volte em breve: novos livros estão sendo cadastrados.';

      return <EstadoVazio icone="search" titulo={titulo} descricao={descricao} />;
    }

    return (
      <>
        <p className="small text-body-secondary mb-2">
          {resposta.meta.total} livro(s)
        </p>

        <div
          className={classes(
            'row',
            'row-cols-2',
            'row-cols-sm-3',
            'row-cols-xl-4',
            'g-3',
          )}
        >
          {resposta.data.map((livro) => (
            <div key={livro.id} className="col">
              <CardLivro livro={livro} />
            </div>
          ))}
        </div>

        <Paginacao
          pagina={resposta.meta.current_page}
          ultima={resposta.meta.last_page}
          aoMudar={aoMudarPagina}
        />
      </>
    );
  }

  return (
    <>
      <section className="mb-4">
        <p className="text-body-secondary mb-0">
          Sua próxima leitura está aqui, aproveite nossa categorização aprimorada
          com CDD e CDU para encontrar sua nova aventura.
        </p>
      </section>

      <div className="row g-4">
        <aside className="col-lg-3" aria-label="Filtros">
          <div className="card">
            <div className="card-header">
              <h2 className="h6 m-0">Filtros</h2>
            </div>

            <div
              className={classes(
                'card-body',
                'd-flex',
                'flex-column',
                'gap-3',
              )}
            >
              <div className="form-check m-0">
                <input
                  id="disp"
                  type="checkbox"
                  className="form-check-input"
                  checked={disponivel}
                  onChange={aoMarcarDisponivel}
                />

                <label htmlFor="disp" className="form-check-label">
                  Só disponíveis
                </label>
              </div>

              <div>
                <label className="form-label" htmlFor="ordem">
                  Ordenar por
                </label>

                <select
                  id="ordem"
                  className="form-select"
                  value={ordem}
                  onChange={aoMudarOrdem}
                >
                  <option value="titulo">Título (A–Z)</option>
                  <option value="recentes">Mais recentes</option>
                </select>
              </div>

              <hr className="my-0" />

              {areas.length > 0 && (
                <FiltroAreas areas={areas} selecao={selecao} aoMudar={mudarSelecao} />
              )}
            </div>
          </div>
        </aside>

        <section className="col-lg-9" aria-live="polite">
          {mostrarFiltrosAtivos && (
            <div
              className={classes(
                'd-flex',
                'flex-wrap',
                'align-items-center',
                'gap-2',
                'mb-3',
              )}
            >
              {ativos.map((filtro) => (
                <span
                  key={filtro.chave}
                  className={classes(
                    'badge',
                    'rounded-pill',
                    'text-bg-primary',
                    'd-inline-flex',
                    'align-items-center',
                    'gap-1',
                  )}
                >
                  {filtro.rotulo}

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    style={{ fontSize: '0.6em' }}
                    aria-label={`Remover filtro ${filtro.rotulo}`}
                    onClick={filtro.remover}
                  />
                </span>
              ))}

              {filtrando && (
                <button
                  type="button"
                  className={classes(
                    'btn',
                    'btn-link',
                    'btn-sm',
                    'text-decoration-none',
                  )}
                  onClick={limparFiltros}
                >
                  <i className="bi bi-x-lg me-1" aria-hidden="true" />
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {resultados()}
        </section>
      </div>
    </>
  );
}
