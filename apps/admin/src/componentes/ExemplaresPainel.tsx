import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';
import { mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Exemplar, ExemplarPayload } from '../api/tipos';
import { classes } from '../utilitarios/classes';
import { Campo } from './Campo';
import { Modal } from './Modal';
import { SeloStatus } from './SeloStatus';
import { useToast } from './toastContexto';

interface FormExemplar {
  codigo: string;
  indisponivel: boolean;
  observacao: string;
}

const FORM_VAZIO: FormExemplar = {
  codigo: '',
  indisponivel: false,
  observacao: '',
};

const QUANTIDADE_MINIMA = 1;

const QUANTIDADE_MAXIMA = 50;

const SELO_INDISPONIVEL = {
  backgroundColor: 'var(--bs-orange)',
  fontSize: '0.65em',
};

function atualizarExemplares(qc: QueryClient, livroId: number): void {
  qc.invalidateQueries({ queryKey: queryKeys.livros.exemplares(livroId) });
  qc.invalidateQueries({ queryKey: queryKeys.livros.detalhe(livroId) });
}

function paraPayload(form: FormExemplar): ExemplarPayload {
  const status = form.indisponivel
    ? 'indisponivel'
    : 'disponivel';

  const observacao = form.observacao.trim() || null;

  return {
    codigo: form.codigo,
    status,
    observacao,
  };
}

export function ExemplaresPainel({ livroId }: { livroId: number }) {
  const qc = useQueryClient();
  const toast = useToast();

  const [editando, setEditando] = useState<Exemplar | null>(null);
  const [form, setForm] = useState<FormExemplar>(FORM_VAZIO);

  const lista = useQuery({
    queryKey: queryKeys.livros.exemplares(livroId),
    queryFn: () => admin.exemplares(livroId),
  });

  function mostrarErro(erro: unknown) {
    toast.erro(mensagemDeErro(erro));
  }

  const salvar = useMutation({
    mutationFn: (id: number) => {
      const dados = paraPayload(form);

      return admin.atualizarExemplar(id, dados);
    },

    onSuccess: () => {
      toast.sucesso('Exemplar atualizado.');

      setEditando(null);

      atualizarExemplares(qc, livroId);
    },

    onError: mostrarErro,
  });

  const excluir = useMutation({
    mutationFn: (exemplar: Exemplar) => admin.excluirExemplar(exemplar.id),

    onSuccess: () => {
      toast.sucesso('Exemplar excluído.');

      atualizarExemplares(qc, livroId);
    },

    onError: mostrarErro,
  });

  function editar(exemplar: Exemplar) {
    setForm({
      codigo: exemplar.codigo,
      indisponivel: exemplar.status === 'indisponivel',
      observacao: exemplar.observacao ?? '',
    });

    setEditando(exemplar);
  }

  function fecharEdicao() {
    setEditando(null);
  }

  function aoDigitarCodigo(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, codigo: e.target.value });
  }

  function aoMarcarIndisponivel(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, indisponivel: e.target.checked });
  }

  function aoDigitarObservacao(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, observacao: e.target.value });
  }

  function modalEdicao() {
    const titulo = editando
      ? `Editar exemplar ${editando.codigo}`
      : 'Editar exemplar';

    function aoSalvar() {
      if (editando) salvar.mutate(editando.id);
    }

    return (
      <Modal
        aberto={editando !== null}
        aoFechar={fecharEdicao}
        titulo={titulo}
        tamanho="pequeno"
        bloqueado={salvar.isPending}
        rodape={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={salvar.isPending}
              onClick={fecharEdicao}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={salvar.isPending}
              onClick={aoSalvar}
            >
              {salvar.isPending && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              )}
              Salvar
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          <Campo rotulo="Tombo" htmlFor="exemplar-codigo">
            <input
              id="exemplar-codigo"
              className="form-control font-monospace"
              value={form.codigo}
              onChange={aoDigitarCodigo}
            />
          </Campo>

          <Campo rotulo="Observação" htmlFor="exemplar-observacao">
            <input
              id="exemplar-observacao"
              className="form-control"
              placeholder="Danificado, em restauro…"
              value={form.observacao}
              onChange={aoDigitarObservacao}
            />
          </Campo>

          <div className="form-check m-0">
            <input
              id="exemplar-indisponivel"
              type="checkbox"
              className="form-check-input"
              checked={form.indisponivel}
              onChange={aoMarcarIndisponivel}
            />

            <label htmlFor="exemplar-indisponivel" className="form-check-label">
              Indisponível
            </label>
          </div>
        </div>
      </Modal>
    );
  }

  function item(exemplar: Exemplar) {
    const emUso = exemplar.status === 'reservado'
      || exemplar.status === 'emprestado';

    const indisponivel = exemplar.status === 'indisponivel';

    return (
      <li
        key={exemplar.id}
        className={classes(
          'list-group-item',
          'item-exemplar',
          'd-flex',
          'align-items-center',
          'gap-2',
        )}
      >
        <span className="font-monospace flex-grow-1">{exemplar.codigo}</span>

        {exemplar.observacao && (
          <i
            className="bi bi-chat-left-text text-body-secondary"
            title={exemplar.observacao}
            aria-label={`Observação: ${exemplar.observacao}`}
          />
        )}

        {indisponivel && (
          <span
            className={classes(
              'badge',
              'rounded-pill',
              'fw-normal',
              'text-white',
            )}
            style={SELO_INDISPONIVEL}
          >
            Indisponível
          </span>
        )}

        {emUso && <SeloStatus status={exemplar.status} />}

        <div className="d-flex">
          <button
            type="button"
            className="btn btn-sm acao-exemplar"
            title="Editar"
            aria-label={`Editar exemplar ${exemplar.codigo}`}
            disabled={emUso}
            onClick={() => editar(exemplar)}
          >
            <i className="bi bi-pencil" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="btn btn-sm acao-exemplar text-danger"
            title="Excluir"
            aria-label={`Excluir exemplar ${exemplar.codigo}`}
            disabled={emUso}
            onClick={() => excluir.mutate(exemplar)}
          >
            <i className="bi bi-trash" aria-hidden="true" />
          </button>
        </div>
      </li>
    );
  }

  function conteudo(exemplares: Exemplar[]) {
    if (lista.isLoading) {
      return <span className="small text-body-secondary">Carregando…</span>;
    }

    if (exemplares.length === 0) {
      return (
        <p className="small text-body-secondary m-0">
          Nenhum exemplar. Use “Adicionar exemplar” para o livro poder ser reservado.
        </p>
      );
    }

    return (
      <ul className="list-group">
        {exemplares.map(item)}
      </ul>
    );
  }

  const exemplares = lista.data ?? [];
  const disponiveis = exemplares.filter((e) => e.status === 'disponivel');

  return (
    <section aria-label="Exemplares">
      <h3
        className={classes(
          'h6',
          'd-flex',
          'align-items-baseline',
          'justify-content-between',
          'gap-2',
        )}
      >
        Exemplares

        <span className="small text-body-secondary fw-normal">
          {disponiveis.length} de {exemplares.length} disponíveis
        </span>
      </h3>

      {conteudo(exemplares)}

      {modalEdicao()}
    </section>
  );
}

export function AdicionarExemplares({ livroId }: { livroId: number }) {
  const qc = useQueryClient();
  const toast = useToast();

  const [quantidade, setQuantidade] = useState(QUANTIDADE_MINIMA);

  const adicionar = useMutation({
    mutationFn: () => admin.adicionarExemplares(livroId, quantidade),

    onSuccess: (novos) => {
      const mensagem = (novos.length === 1)
        ? 'Exemplar adicionado.'
        : `${novos.length} exemplares adicionados.`;

      toast.sucesso(mensagem);

      setQuantidade(QUANTIDADE_MINIMA);

      atualizarExemplares(qc, livroId);
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  function aoMudarQuantidade(e: ChangeEvent<HTMLInputElement>) {
    const digitado = Number(e.target.value) || QUANTIDADE_MINIMA;
    const semPassarDoMaximo = Math.min(QUANTIDADE_MAXIMA, digitado);
    const valor = Math.max(QUANTIDADE_MINIMA, semPassarDoMaximo);

    setQuantidade(valor);
  }

  const sufixoPlural = (quantidade > 1)
    ? 'es'
    : '';

  return (
    <>
      <input
        type="number"
        min={QUANTIDADE_MINIMA}
        max={QUANTIDADE_MAXIMA}
        className="form-control"
        style={{ width: 80 }}
        aria-label="Quantidade de exemplares a adicionar"
        value={quantidade}
        onChange={aoMudarQuantidade}
      />

      <button
        type="button"
        className="btn btn-secondary"
        disabled={adicionar.isPending}
        onClick={() => adicionar.mutate()}
      >
        {adicionar.isPending ? (
          <span
            className="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          />
        ) : (
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
        )}
        Adicionar exemplar{sufixoPlural}
      </button>
    </>
  );
}
