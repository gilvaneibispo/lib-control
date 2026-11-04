import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { classes } from '../utilitarios/classes';
import { ToastContexto, type ToastApi } from './toastContexto';

type Tom = 'success' | 'danger' | 'primary';

interface Item {
  id: number;
  mensagem: ReactNode;
  tom: Tom;
}

const ICONES: Record<Tom, string> = {
  success: 'check-circle',
  danger: 'exclamation-circle',
  primary: 'info-circle',
};

const DURACAO = 5000;

const MAXIMO_VISIVEIS = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<Item[]>([]);
  const proximoId = useRef(1);

  const remover = useCallback((id: number) => {
    setItens((atual) => atual.filter((item) => item.id !== id));
  }, []);

  const mostrar = useCallback((mensagem: ReactNode, tom: Tom) => {
    const id = proximoId.current++;
    const novo: Item = { id, mensagem, tom };

    setItens((atual) => {
      const recentes = atual.slice(-(MAXIMO_VISIVEIS - 1));

      return [...recentes, novo];
    });

    window.setTimeout(() => remover(id), DURACAO);
  }, [remover]);

  const api = useMemo<ToastApi>(() => {
    return {
      sucesso: (mensagem) => mostrar(mensagem, 'success'),
      erro: (mensagem) => mostrar(mensagem, 'danger'),
      info: (mensagem) => mostrar(mensagem, 'primary'),
    };
  }, [mostrar]);

  return (
    <ToastContexto.Provider value={api}>
      {children}

      <div
        className={classes(
          'toast-container',
          'position-fixed',
          'bottom-0',
          'end-0',
          'p-3',
        )}
        aria-live="polite"
      >
        {itens.map((item) => {
          const papel = (item.tom === 'danger')
            ? 'alert'
            : 'status';

          return (
            <div
              key={item.id}
              className={classes(
                'toast',
                'show',
                'align-items-center',
                `text-bg-${item.tom}`,
                'border-0',
              )}
              role={papel}
            >
              <div className="d-flex">
                <div className="toast-body d-flex gap-2">
                  <i className={`bi bi-${ICONES[item.tom]}`} aria-hidden="true" />

                  <div>{item.mensagem}</div>
                </div>

                <button
                  type="button"
                  className={classes(
                    'btn-close',
                    'btn-close-white',
                    'me-2',
                    'm-auto',
                  )}
                  aria-label="Fechar aviso"
                  onClick={() => remover(item.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContexto.Provider>
  );
}
