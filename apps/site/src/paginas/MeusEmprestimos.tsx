import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { leitor } from '../api/servicos';
import type { Emprestimo } from '../api/tipos';
import { Alerta } from '../componentes/Alerta';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { EstadoVazio } from '../componentes/EstadoVazio';
import { SeloStatus } from '../componentes/SeloStatus';
import { useSessao } from '../sessao';
import { classes } from '../utilitarios/classes';
import {
  formatarData,
  formatarDiaSemana,
  listarAutores,
  textoPrazo,
} from '../utilitarios/formatadores';

function LinhaEmprestimo({ emprestimo }: { emprestimo: Emprestimo }) {
  const atrasado = emprestimo.status === 'atrasado';
  const devolvido = emprestimo.status === 'devolvido';
  const livro = emprestimo.exemplar?.livro;

  function prazo() {
    if (devolvido) {
      const emprestadoEm = formatarData(emprestimo.emprestado_em);
      const devolvidoEm = formatarData(emprestimo.devolvido_em);

      return (
        <span className="text-body-secondary">
          Emprestado em {emprestadoEm} · devolvido em {devolvidoEm}
        </span>
      );
    }

    const classePrazo = atrasado
      ? 'text-danger fw-semibold'
      : undefined;

    return (
      <>
        Devolver até <strong>{formatarDiaSemana(emprestimo.devolver_ate)}</strong>
        {' · '}
        <span className={classePrazo}>{textoPrazo(emprestimo.dias_restantes)}</span>
      </>
    );
  }

  return (
    <li className={classes('card', atrasado && 'border-danger')}>
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
            {prazo()}
          </div>
        </div>

        <SeloStatus status={emprestimo.status} />
      </div>
    </li>
  );
}

function ListaEmprestimos({ itens }: { itens: Emprestimo[] }) {
  return (
    <ul className="list-unstyled d-flex flex-column gap-2 m-0">
      {itens.map((emprestimo) => (
        <LinhaEmprestimo key={emprestimo.id} emprestimo={emprestimo} />
      ))}
    </ul>
  );
}

export function MeusEmprestimos() {
  const { data: sessao } = useSessao();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.me.emprestimos,
    queryFn: () => leitor.emprestimos(),
  });

  const todos = data?.data ?? [];
  const atuais = todos.filter((e) => e.status !== 'devolvido');
  const historico = todos.filter((e) => e.status === 'devolvido');

  const bloqueado = Boolean(sessao?.data.bloqueado);
  const motivoBloqueio = sessao?.data.motivo_bloqueio;

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

    return (
      <>
        <h2 className="h5 fw-semibold">Com você</h2>

        {atuais.length === 0 ? (
          <EstadoVazio
            icone="book"
            titulo="Nenhum livro com você agora"
            descricao="Reserve no catálogo e retire no balcão."
          />
        ) : (
          <ListaEmprestimos itens={atuais} />
        )}

        <h2 className="h5 fw-semibold mt-4">Histórico</h2>

        {historico.length === 0 ? (
          <EstadoVazio icone="clock-history" titulo="Sem devoluções ainda" />
        ) : (
          <ListaEmprestimos itens={historico} />
        )}
      </>
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Meus empréstimos"
        descricao="Prazos dos livros que estão com você e histórico de devoluções."
      />

      {bloqueado && (
        <div className="mb-3">
          <Alerta tom="danger" titulo="Seu cadastro está bloqueado">
            {motivoBloqueio}. Enquanto isso, não é possível reservar nem pegar livros.
            Procure a biblioteca para regularizar.
          </Alerta>
        </div>
      )}

      {conteudo()}
    </>
  );
}
