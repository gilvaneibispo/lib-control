import type { ReactNode } from 'react';

interface Props {
  rotulo: ReactNode;
  htmlFor?: string;
  erro?: string;
  dica?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Campo({ rotulo, htmlFor, erro, dica, className, children }: Props) {
  function rodape() {
    if (erro) {
      return (
        <div className="invalid-feedback d-block" role="alert">
          {erro}
        </div>
      );
    }

    if (dica) return <div className="form-text">{dica}</div>;

    return null;
  }

  return (
    <div className={className}>
      <label className="form-label" htmlFor={htmlFor}>
        {rotulo}
      </label>

      {children}

      {rodape()}
    </div>
  );
}
