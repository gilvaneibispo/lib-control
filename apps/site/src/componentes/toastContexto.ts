import { createContext, useContext, type ReactNode } from 'react';

export interface ToastApi {
  sucesso: (mensagem: ReactNode) => void;
  erro: (mensagem: ReactNode) => void;
  info: (mensagem: ReactNode) => void;
}

export const ToastContexto = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const contexto = useContext(ToastContexto);

  if (!contexto) throw new Error('useToast precisa estar dentro de <ToastProvider>');

  return contexto;
}
