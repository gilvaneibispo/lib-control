import { useEffect, useRef, useState, type FormEvent } from 'react';

interface Props {
  valor: string;
  aoBuscar: (termo: string) => void;
  placeholder: string;
  rotulo?: string;
}

const ESPERA_DIGITACAO = 350;

export function Busca({ valor, aoBuscar, placeholder, rotulo = 'Buscar' }: Props) {
  const [texto, setTexto] = useState(valor);
  const [valorAnterior, setValorAnterior] = useState(valor);

  const temporizador = useRef<number | undefined>(undefined);

  if (valor !== valorAnterior) {
    setValorAnterior(valor);

    if (valor !== texto.trim()) setTexto(valor);
  }

  useEffect(() => {
    return () => window.clearTimeout(temporizador.current);
  }, []);

  function digitar(novo: string) {
    setTexto(novo);

    window.clearTimeout(temporizador.current);

    temporizador.current = window.setTimeout(() => {
      aoBuscar(novo.trim());
    }, ESPERA_DIGITACAO);
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    window.clearTimeout(temporizador.current);

    aoBuscar(texto.trim());
  }

  return (
    <form
      style={{ minWidth: 240, maxWidth: 400 }}
      role="search"
      onSubmit={enviar}
    >
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-search" aria-hidden="true" />
        </span>

        <input
          type="search"
          className="form-control"
          placeholder={placeholder}
          aria-label={rotulo}
          value={texto}
          onChange={(e) => digitar(e.target.value)}
        />
      </div>
    </form>
  );
}
