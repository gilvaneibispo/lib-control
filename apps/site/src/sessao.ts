import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { queryKeys } from './api/queryKeys';
import { auth } from './api/servicos';
import type { Sessao } from './api/tipos';

async function buscarSessao(): Promise<Sessao | null> {
  try {
    const sessao = await auth.sessao();
    const ehLeitor = sessao.data.papel === 'leitor';

    return ehLeitor
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
    staleTime: 60_000,
  });
}

export function useDefinirSessao() {
  const qc = useQueryClient();

  return (sessao: Sessao | null) => {
    qc.setQueryData(queryKeys.sessao, sessao);
  };
}

export function useRecarregarSessao() {
  const qc = useQueryClient();

  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.sessao });
  };
}
