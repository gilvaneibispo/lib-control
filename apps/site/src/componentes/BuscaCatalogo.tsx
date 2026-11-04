import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

const ESPERA_DIGITACAO = 350;

export function BuscaCatalogo() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';

  const [texto, setTexto] = useState(q);
  const [qAnterior, setQAnterior] = useState(q);

  const temporizador = useRef<number | undefined>(undefined);

  if (q !== qAnterior) {
    setQAnterior(q);

    if (q !== texto.trim()) setTexto(q);
  }

  useEffect(() => {
    return () => window.clearTimeout(temporizador.current);
  }, []);

  function buscar(valor: string) {
    setParams(
      (atual) => {
        const novos = new URLSearchParams(atual);

        if (valor) novos.set('q', valor);
        else novos.delete('q');

        novos.delete('page');

        return novos;
      },
      { replace: true },
    );
  }

  function digitar(valor: string) {
    setTexto(valor);

    window.clearTimeout(temporizador.current);

    temporizador.current = window.setTimeout(() => {
      buscar(valor.trim());
    }, ESPERA_DIGITACAO);
  }

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    window.clearTimeout(temporizador.current);

    buscar(texto.trim());
  }

  return (
    <form
      className="flex-grow-1"
      style={{ maxWidth: 480 }}
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
          placeholder="Título, autor ou ISBN"
          aria-label="Buscar no acervo"
          value={texto}
          onChange={(e) => digitar(e.target.value)}
        />
      </div>
    </form>
  );
}
