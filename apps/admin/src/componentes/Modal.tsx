import { useEffect, useId, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { classes } from '../utilitarios/classes';

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  bloqueado?: boolean;
  rodape?: ReactNode;
  tamanho?: 'pequeno' | 'normal' | 'grande';
  children?: ReactNode;
}

export function Modal(props: Props) {
  const {
    aberto,
    aoFechar,
    titulo,
    descricao,
    bloqueado = false,
    rodape,
    tamanho = 'normal',
    children,
  } = props;

  const idTitulo = useId();

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !bloqueado) aoFechar();
    };

    document.addEventListener('keydown', aoTeclar);
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.classList.remove('modal-open');
    };
  }, [aberto, bloqueado, aoFechar]);

  if (!aberto) return null;

  function aoClicarFora(e: MouseEvent<HTMLDivElement>) {
    const clicouNoFundo = e.target === e.currentTarget;

    if (clicouNoFundo && !bloqueado) aoFechar();
  }

  const temCorpo = Boolean(descricao || children);

  const grande = tamanho === 'grande';
  const pequeno = tamanho === 'pequeno';

  const classeDescricao = children
    ? 'text-body-secondary'
    : 'text-body-secondary mb-0';

  return createPortal(
    <>
      <div
        className={classes(
          'modal',
          'fade',
          'show',
          'd-block',
        )}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onClick={aoClicarFora}
      >
        <div
          className={classes(
            'modal-dialog',
            !grande && 'modal-dialog-centered',
            pequeno && 'modal-sm',
            grande && 'modal-grande',
          )}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title fs-5" id={idTitulo}>
                {titulo}
              </h2>

              <button
                type="button"
                className="btn-close"
                aria-label="Fechar"
                disabled={bloqueado}
                onClick={aoFechar}
              />
            </div>

            {temCorpo && (
              <div className="modal-body">
                {descricao && <p className={classeDescricao}>{descricao}</p>}

                {children}
              </div>
            )}

            {rodape && <div className="modal-footer">{rodape}</div>}
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>,
    document.body,
  );
}
