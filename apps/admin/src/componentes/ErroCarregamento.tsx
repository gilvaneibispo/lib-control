import { mensagemDeErro } from '../api/erros';
import { EstadoVazio } from './EstadoVazio';

interface Props {
  erro: unknown;
  aoTentar?: () => void;
}

export function ErroCarregamento({ erro, aoTentar }: Props) {
  const acao = aoTentar && (
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={aoTentar}
    >
      <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
      Tentar novamente
    </button>
  );

  return (
    <EstadoVazio
      icone="exclamation-triangle"
      titulo="Não foi possível carregar"
      descricao={mensagemDeErro(erro)}
      acao={acao}
    />
  );
}
