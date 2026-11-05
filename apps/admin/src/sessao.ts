import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { queryKeys } from './api/queryKeys';
import { auth } from './api/servicos';
import type { Sessao } from './api/tipos';

const CINCO_MINUTOS = 5 * 60_000;

async function buscarSessao(): Promise<Sessao | null> {
  try {
    const sessao = await auth.sessao();
    const ehAdmin = sessao.data.papel === 'admin';

    return ehAdmin
      ? sessao
      : null;
  } catch (erro) {
    const naoAutenticado = isAxiosError(erro) && erro.response?.status === 401;

    if (naoAutenticado) return null;

    throw erro;
  }
}

export function useSessao() {
  return useQuery<Sessao | null>({
    queryKey: queryKeys.sessao,
    queryFn: buscarSessao,
    staleTime: CINCO_MINUTOS,
  });
}

export function useDefinirSessao() {
  const qc = useQueryClient();

  return (sessao: Sessao | null) => {
    qc.setQueryData(queryKeys.sessao, sessao);
  };
}
