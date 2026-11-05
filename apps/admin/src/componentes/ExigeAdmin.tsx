import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessao } from '../sessao';
import { Carregando } from './Carregando';

export function ExigeAdmin({ children }: { children: ReactNode }) {
  const { data: sessao, isLoading } = useSessao();
  const local = useLocation();

  if (isLoading) return <Carregando />;

  if (!sessao) {
    const origem = { de: local.pathname };

    return <Navigate to="/entrar" replace state={origem} />;
  }

  return <>{children}</>;
}
