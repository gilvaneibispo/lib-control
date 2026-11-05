import { useState, type KeyboardEvent } from 'react';
import { classes } from '../utilitarios/classes';

interface Props {
  id?: string;
  value: string[];
  onChange: (autores: string[]) => void;
}

const ESPERA_AO_SAIR = 150;

function mesmoNome(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function AutoresInput({ id, value, onChange }: Props) {
  const [texto, setTexto] = useState('');

  function adicionar(nome: string) {
    const semEspacosNasPontas = nome.trim();
    const limpo = semEspacosNasPontas.replace(/\s+/g, ' ');
    const repetido = value.some((autor) => mesmoNome(autor, limpo));

    if (limpo && !repetido) onChange([...value, limpo]);

    setTexto('');
  }

  function remover(nome: string) {
    const restantes = value.filter((autor) => autor !== nome);

    onChange(restantes);
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    const confirmou = e.key === 'Enter' || e.key === ',';
    const apagouUltimo = e.key === 'Backspace' && texto === '' && value.length > 0;

    if (confirmou) {
      e.preventDefault();

      adicionar(texto);

      return;
    }

    if (apagouUltimo) {
      const semUltimo = value.slice(0, -1);

      onChange(semUltimo);
    }
  }

  function aoSair() {
    window.setTimeout(() => {
      if (texto.trim()) adicionar(texto);
    }, ESPERA_AO_SAIR);
  }

  const dica = (value.length > 0)
    ? ''
    : 'Digite e pressione Enter';

  return (
    <div
      className={classes(
        'form-control',
        'd-flex',
        'flex-wrap',
        'align-items-center',
        'gap-1',
      )}
    >
      {value.map((autor) => (
        <span
          key={autor}
          className={classes(
            'badge',
            'rounded-pill',
            'text-bg-light',
            'border',
            'd-inline-flex',
            'align-items-center',
            'gap-1',
          )}
        >
          {autor}

          <button
            type="button"
            className="btn-close"
            style={{ fontSize: '0.6em' }}
            aria-label={`Remover ${autor}`}
            onClick={() => remover(autor)}
          />
        </span>
      ))}

      <input
        id={id}
        className={classes(
          'border-0',
          'bg-transparent',
          'flex-grow-1',
        )}
        style={{ minWidth: 140, outline: 'none' }}
        placeholder={dica}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={aoTeclar}
        onBlur={aoSair}
      />
    </div>
  );
}
