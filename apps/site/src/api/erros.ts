import { isAxiosError } from 'axios';

interface CorpoErro {
  codigo?: string;
  mensagem?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export const MENSAGENS_ERRO: Record<string, string> = {
  LEITOR_BLOQUEADO: 'Seu cadastro está bloqueado. Procure a biblioteca.',
  EMPRESTIMO_ATRASADO: 'Há um empréstimo em atraso. Devolva-o para voltar a reservar.',
  LIMITE_ATINGIDO: 'Você atingiu o limite de reservas e empréstimos simultâneos.',
  LIVRO_JA_COM_LEITOR: 'Você já tem uma reserva ou empréstimo deste livro.',
  SEM_EXEMPLAR_DISPONIVEL: 'Não há exemplar disponível deste livro no momento.',
  RESERVA_NAO_ATIVA: 'Esta reserva não está mais ativa.',
  EXEMPLAR_INDISPONIVEL: 'Este exemplar não está disponível.',
  CREDENCIAIS_INVALIDAS: 'E-mail ou senha incorretos.',
  PAPEL_INCOMPATIVEL: 'Esta conta não tem acesso a este aplicativo.',
  CEP_NAO_ENCONTRADO: 'CEP não encontrado. Preencha o endereço manualmente.',
  CEP_INDISPONIVEL: 'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.',
  ACESSO_NEGADO: 'Você não tem permissão para esta ação.',
  NAO_ENCONTRADO: 'Registro não encontrado.',
};

export function codigoDoErro(erro: unknown): string | null {
  if (!isAxiosError<CorpoErro>(erro)) return null;

  return erro.response?.data?.codigo ?? null;
}

export function errosDeValidacao(erro: unknown): Record<string, string> {
  if (!isAxiosError<CorpoErro>(erro)) return {};

  const errors = erro.response?.data?.errors;

  if (!errors) return {};

  const pares = Object.entries(errors).map(([campo, mensagens]) => {
    const primeiraMensagem = mensagens[0] ?? 'Inválido';

    return [campo, primeiraMensagem];
  });

  return Object.fromEntries(pares);
}

const MENSAGEM_PADRAO = 'Algo deu errado. Tente novamente.';

export function mensagemDeErro(erro: unknown, padrao = MENSAGEM_PADRAO): string {
  if (!isAxiosError<CorpoErro>(erro)) return padrao;

  if (!erro.response) return 'Sem conexão com o servidor. Verifique sua rede.';

  const codigo = erro.response.data?.codigo;

  if (codigo && MENSAGENS_ERRO[codigo]) return MENSAGENS_ERRO[codigo];

  const mensagensDeValidacao = Object.values(errosDeValidacao(erro));

  if (mensagensDeValidacao.length > 0) return mensagensDeValidacao[0];

  const status = erro.response.status;

  switch (status) {
    case 401:
      return 'Sua sessão expirou. Entre novamente.';

    case 403:
      return MENSAGENS_ERRO.ACESSO_NEGADO;

    case 404:
      return MENSAGENS_ERRO.NAO_ENCONTRADO;

    case 419:
      return 'Sessão expirada. Recarregue a página.';

    case 429:
      return 'Muitas tentativas. Aguarde um minuto.';

    default:
      return (status >= 500)
        ? 'Erro no servidor. Tente novamente em instantes.'
        : padrao;
  }
}
