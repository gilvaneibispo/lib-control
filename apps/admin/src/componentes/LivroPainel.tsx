import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Livro } from '../api/tipos';
import { classes } from '../utilitarios/classes';
import { listarAutores } from '../utilitarios/formatadores';
import { Capa } from './Capa';
import { Carregando } from './Carregando';
import { ErroCarregamento } from './ErroCarregamento';
import { AdicionarExemplares, ExemplaresPainel } from './ExemplaresPainel';
import { Modal } from './Modal';
import { useToast } from './toastContexto';

interface Props {
  livroId: number;
  aoExcluir: () => void;
  aoFechar: () => void;
}

interface Propriedade {
  rotulo: string;
  valor: ReactNode;
}

function classificacao(livro: Livro): ReactNode {
  if (!livro.area) return '—';

  return (
    <>
      {livro.area.nome}
      {livro.subarea && ` › ${livro.subarea.nome}`}
    </>
  );
}

function propriedades(livro: Livro): Propriedade[] {
  const lista: Propriedade[] = [];

  if (livro.subtitulo) {
    lista.push({ rotulo: 'Subtítulo', valor: livro.subtitulo });
  }

  lista.push(
    {
      rotulo: 'ISBN',
      valor: <span className="font-monospace">{livro.isbn ?? '—'}</span>,
    },
    {
      rotulo: 'Editora',
      valor: livro.editora ?? '—',
    },
    {
      rotulo: 'Ano',
      valor: livro.ano ?? '—',
    },
    {
      rotulo: 'CDD / CDU',
      valor: (
        <span className="font-monospace">
          {livro.cdd ?? '—'} / {livro.cdu ?? '—'}
        </span>
      ),
    },
    {
      rotulo: 'Classificação',
      valor: classificacao(livro),
    },
  );

  if (livro.sinopse) {
    lista.push({
      rotulo: 'Sinopse',
      valor: <span style={{ whiteSpace: 'pre-line' }}>{livro.sinopse}</span>,
    });
  }

  return lista;
}

export function LivroPainel({ livroId, aoExcluir, aoFechar }: Props) {
  const navegar = useNavigate();
  const local = useLocation();
  const toast = useToast();
  const qc = useQueryClient();

  const [confirmando, setConfirmando] = useState(false);

  const { data: livro, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.livros.detalhe(livroId),
    queryFn: () => admin.livro(livroId),
  });

  const excluir = useMutation({
    mutationFn: () => admin.excluirLivro(livroId),

    onSuccess: () => {
      toast.sucesso('Livro excluído.');

      setConfirmando(false);

      qc.invalidateQueries({ queryKey: queryKeys.livros.todos });

      aoExcluir();
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  if (isLoading) return <Carregando />;

  if (error || !livro) return <ErroCarregamento erro={error} aoTentar={refetch} />;

  function abrirEdicao() {
    navegar({ pathname: `/livros/${livroId}`, search: local.search });
  }

  function fecharConfirmacao() {
    setConfirmando(false);
  }

  const descricaoExclusao = `“${livro.titulo}” sairá do catálogo. `
    + 'Livros com exemplares reservados ou emprestados não podem ser excluídos.';

  return (
    <>
      <div className="d-flex flex-column gap-4">
        <div className="d-flex align-items-start gap-3">
          <div className="flex-shrink-0" style={{ width: 112 }}>
            <Capa url={livro.capa_url} titulo={livro.titulo} />
          </div>

          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <h2 className="h5 fw-semibold mb-1 text-break">{livro.titulo}</h2>

            <p className="small text-body-secondary mb-0">
              {listarAutores(livro.autores)}
            </p>
          </div>

          <button
            type="button"
            className="btn-close flex-shrink-0"
            aria-label="Fechar detalhes"
            onClick={aoFechar}
          />
        </div>

        <dl className="row small m-0 gy-2">
          {propriedades(livro).map((item) => (
            <div key={item.rotulo} className="col-12 d-flex gap-3">
              <dt
                className={classes(
                  'text-body-secondary',
                  'fw-normal',
                  'flex-shrink-0',
                )}
                style={{ width: 110 }}
              >
                {item.rotulo}
              </dt>

              <dd className="m-0">{item.valor}</dd>
            </div>
          ))}
        </dl>

        <ExemplaresPainel livroId={livro.id} />

        <div
          className={classes(
            'd-flex',
            'flex-wrap',
            'align-items-center',
            'justify-content-end',
            'gap-2',
            'border-top',
            'pt-3',
          )}
        >
          <AdicionarExemplares livroId={livro.id} />

          <button
            type="button"
            className="btn btn-secondary"
            onClick={abrirEdicao}
          >
            <i className="bi bi-pencil me-1" aria-hidden="true" />
            Editar
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirmando(true)}
          >
            <i className="bi bi-trash me-1" aria-hidden="true" />
            Excluir
          </button>
        </div>
      </div>

      <Modal
        aberto={confirmando}
        aoFechar={fecharConfirmacao}
        titulo="Excluir livro"
        descricao={descricaoExclusao}
        bloqueado={excluir.isPending}
        rodape={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={fecharConfirmacao}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-danger"
              disabled={excluir.isPending}
              onClick={() => excluir.mutate()}
            >
              {excluir.isPending ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-trash me-1" aria-hidden="true" />
              )}
              Excluir
            </button>
          </>
        }
      />
    </>
  );
}
