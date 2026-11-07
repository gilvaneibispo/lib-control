import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Emprestimo, Exemplar, Leitor } from '../api/tipos';
import { listarAutores } from '../utilitarios/formatadores';
import { ocultarCpf } from '../utilitarios/mascaras';
import { Avatar } from './Avatar';
import { Campo } from './Campo';
import { Capa } from './Capa';
import { Modal } from './Modal';
import { SeloStatus } from './SeloStatus';
import { useToast } from './toastContexto';

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoEmprestar: (emprestimo: Emprestimo) => void;
}

const ESPERA_DIGITACAO = 350;
const TAMANHO_MINIMO_BUSCA = 2;
const MAXIMO_RESULTADOS = 8;

function useTermoAtrasado(texto: string): string {
  const [termo, setTermo] = useState(texto.trim());

  useEffect(() => {
    const temporizador = window.setTimeout(() => setTermo(texto.trim()), ESPERA_DIGITACAO);

    return () => window.clearTimeout(temporizador);
  }, [texto]);

  return termo;
}

interface PropsResultados<T> {
  termo: string;
  carregando: boolean;
  erro: unknown;
  itens: T[];
  vazio: string;
  renderizar: (item: T) => ReactNode;
}

function Resultados<T>(props: PropsResultados<T>) {
  const { termo, carregando, erro, itens, vazio, renderizar } = props;

  if (termo.length < TAMANHO_MINIMO_BUSCA) {
    return (
      <p className="small text-body-secondary mt-2 mb-0">
        Digite ao menos {TAMANHO_MINIMO_BUSCA} caracteres.
      </p>
    );
  }

  if (carregando) {
    return (
      <p className="small text-body-secondary mt-2 mb-0">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Buscando…
      </p>
    );
  }

  if (erro) {
    return <p className="small text-danger mt-2 mb-0">{mensagemDeErro(erro)}</p>;
  }

  if (itens.length === 0) {
    return <p className="small text-body-secondary mt-2 mb-0">{vazio}</p>;
  }

  return (
    <div className="list-group mt-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
      {itens.slice(0, MAXIMO_RESULTADOS).map(renderizar)}
    </div>
  );
}

function resumoLeitor(leitor: Leitor) {
  return (
    <span className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
      <Avatar nome={leitor.nome} url={leitor.foto_url} />

      <span className="flex-grow-1" style={{ minWidth: 0 }}>
        <span className="d-block text-truncate">{leitor.nome}</span>

        <span className="d-block small text-body-secondary font-monospace">
          {ocultarCpf(leitor.cpf)}
        </span>
      </span>

      {leitor.bloqueado && <SeloStatus status="bloqueado" />}
    </span>
  );
}

function resumoExemplar(exemplar: Exemplar) {
  const livro = exemplar.livro;
  const titulo = livro?.titulo ?? '';

  return (
    <span className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
      <Capa mini url={livro?.capa_url} titulo={titulo} />

      <span className="flex-grow-1" style={{ minWidth: 0 }}>
        <span className="d-block text-truncate">{titulo}</span>

        <span className="d-block small text-body-secondary text-truncate">
          Tombo <span className="font-monospace">{exemplar.codigo}</span>
          {' · '}
          {listarAutores(livro?.autores)}
        </span>
      </span>
    </span>
  );
}

function Selecionado({ children, aoTrocar }: { children: ReactNode; aoTrocar: () => void }) {
  return (
    <div className="d-flex align-items-center gap-2 border rounded p-2">
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        {children}
      </div>

      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={aoTrocar}>
        Trocar
      </button>
    </div>
  );
}

function Conteudo({ aoFechar, aoEmprestar }: Omit<Props, 'aberto'>) {
  const qc = useQueryClient();
  const toast = useToast();

  const [textoLeitor, setTextoLeitor] = useState('');
  const [textoExemplar, setTextoExemplar] = useState('');
  const [leitor, setLeitor] = useState<Leitor | null>(null);
  const [exemplar, setExemplar] = useState<Exemplar | null>(null);

  const termoLeitor = useTermoAtrasado(textoLeitor);
  const termoExemplar = useTermoAtrasado(textoExemplar);

  const filtrosLeitor = { q: termoLeitor, papel: 'leitor' };

  const leitores = useQuery({
    queryKey: queryKeys.leitores.lista(filtrosLeitor),
    queryFn: () => admin.usuarios(filtrosLeitor),
    enabled: !leitor && termoLeitor.length >= TAMANHO_MINIMO_BUSCA,
  });

  const exemplares = useQuery({
    queryKey: queryKeys.exemplares.disponiveis(termoExemplar),
    queryFn: () => admin.exemplaresDisponiveis(termoExemplar),
    enabled: !exemplar && termoExemplar.length >= TAMANHO_MINIMO_BUSCA,
  });

  const emprestar = useMutation({
    mutationFn: () => admin.emprestar(leitor!.id, exemplar!.id),

    onSuccess: (emprestimo) => {
      toast.sucesso('Empréstimo registrado.');

      qc.invalidateQueries({ queryKey: queryKeys.emprestimos.todos });
      qc.invalidateQueries({ queryKey: queryKeys.livros.todos });
      qc.invalidateQueries({ queryKey: queryKeys.leitores.todos });
      qc.invalidateQueries({ queryKey: queryKeys.painel });
      qc.invalidateQueries({ queryKey: ['exemplares'] });

      aoEmprestar(emprestimo);
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  const pendente = emprestar.isPending;
  const podeConfirmar = Boolean(leitor && exemplar) && !pendente;

  function opcaoLeitor(item: Leitor) {
    return (
      <button
        key={item.id}
        type="button"
        className="list-group-item list-group-item-action"
        onClick={() => setLeitor(item)}
      >
        {resumoLeitor(item)}
      </button>
    );
  }

  function opcaoExemplar(item: Exemplar) {
    return (
      <button
        key={item.id}
        type="button"
        className="list-group-item list-group-item-action"
        onClick={() => setExemplar(item)}
      >
        {resumoExemplar(item)}
      </button>
    );
  }

  function campoLeitor() {
    if (leitor) {
      return (
        <>
          <Selecionado aoTrocar={() => setLeitor(null)}>{resumoLeitor(leitor)}</Selecionado>

          {leitor.bloqueado && (
            <div className="form-text text-danger">
              Leitor bloqueado: o empréstimo será recusado.
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <input
          id="busca-leitor"
          type="search"
          className="form-control"
          placeholder="Nome, e-mail ou CPF"
          autoComplete="off"
          autoFocus
          value={textoLeitor}
          onChange={(e) => setTextoLeitor(e.target.value)}
        />

        <Resultados
          termo={termoLeitor}
          carregando={leitores.isFetching}
          erro={leitores.error}
          itens={leitores.data?.data ?? []}
          vazio="Nenhum leitor encontrado."
          renderizar={opcaoLeitor}
        />
      </>
    );
  }

  function campoExemplar() {
    if (exemplar) {
      return <Selecionado aoTrocar={() => setExemplar(null)}>{resumoExemplar(exemplar)}</Selecionado>;
    }

    return (
      <>
        <input
          id="busca-exemplar"
          type="search"
          className="form-control"
          placeholder="Tombo, título, autor ou ISBN"
          autoComplete="off"
          value={textoExemplar}
          onChange={(e) => setTextoExemplar(e.target.value)}
        />

        <Resultados
          termo={termoExemplar}
          carregando={exemplares.isFetching}
          erro={exemplares.error}
          itens={exemplares.data ?? []}
          vazio="Nenhum exemplar disponível encontrado."
          renderizar={opcaoExemplar}
        />
      </>
    );
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Novo empréstimo"
      descricao="Empréstimo direto no balcão, sem reserva prévia."
      bloqueado={pendente}
      rodape={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pendente}
            onClick={aoFechar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!podeConfirmar}
            onClick={() => emprestar.mutate()}
          >
            {pendente ? (
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            ) : (
              <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />
            )}
            Registrar empréstimo
          </button>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
        <Campo rotulo="Leitor" htmlFor={leitor ? undefined : 'busca-leitor'}>
          {campoLeitor()}
        </Campo>

        <Campo
          rotulo="Exemplar"
          htmlFor={exemplar ? undefined : 'busca-exemplar'}
        >
          {campoExemplar()}
        </Campo>
      </div>
    </Modal>
  );
}

export function NovoEmprestimoModal({ aberto, aoFechar, aoEmprestar }: Props) {
  if (!aberto) return null;

  return <Conteudo aoFechar={aoFechar} aoEmprestar={aoEmprestar} />;
}
