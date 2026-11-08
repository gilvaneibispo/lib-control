import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import { classes } from '../utilitarios/classes';

interface Props {
  id?: string;
  value: string[];
  onChange: (autores: string[]) => void;
}

const ESPERA_AO_SAIR = 150;

const ESPERA_DIGITACAO = 250;

const TAMANHO_MINIMO_BUSCA = 2;

function mesmoNome(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function useTermoAtrasado(texto: string): string {
  const [termo, setTermo] = useState(texto.trim());

  useEffect(() => {
    const temporizador = window.setTimeout(() => setTermo(texto.trim()), ESPERA_DIGITACAO);

    return () => window.clearTimeout(temporizador);
  }, [texto]);

  return termo;
}

export function AutoresInput({ id, value, onChange }: Props) {
  const [texto, setTexto] = useState('');
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(0);

  const listaId = useId();
  const termo = useTermoAtrasado(texto);

  const { data: sugestoes = [] } = useQuery({
    queryKey: queryKeys.autores(termo),
    queryFn: () => admin.autores(termo),
    enabled: termo.length >= TAMANHO_MINIMO_BUSCA,
    staleTime: 60_000,
  });

  const opcoes = sugestoes.filter((sugestao) => {
    const jaAdicionado = value.some((autor) => mesmoNome(autor, sugestao));

    return !jaAdicionado;
  });

  const listaVisivel = aberto
    && opcoes.length > 0
    && termo === texto.trim();

  function adicionar(nome: string) {
    const semEspacosNasPontas = nome.trim();
    const limpo = semEspacosNasPontas.replace(/\s+/g, ' ');
    const repetido = value.some((autor) => mesmoNome(autor, limpo));

    if (limpo && !repetido) onChange([...value, limpo]);

    setTexto('');

    setAberto(false);

    setDestaque(0);
  }

  function remover(nome: string) {
    const restantes = value.filter((autor) => autor !== nome);

    onChange(restantes);
  }

  function descer() {
    const ultimo = Math.max(opcoes.length - 1, 0);

    setAberto(true);

    setDestaque((atual) => Math.min(atual + 1, ultimo));
  }

  function subir() {
    setDestaque((atual) => Math.max(atual - 1, 0));
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    const confirmou = e.key === 'Enter' || e.key === ',';
    const apagouUltimo = e.key === 'Backspace' && texto === '' && value.length > 0;

    if (confirmou) {
      e.preventDefault();

      const opcaoDestacada = opcoes[destaque];

      const escolhido = aberto && opcaoDestacada
        ? opcaoDestacada
        : texto;

      adicionar(escolhido);

      return;
    }

    if (apagouUltimo) {
      const semUltimo = value.slice(0, -1);

      onChange(semUltimo);

      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();

      descer();

      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      subir();

      return;
    }

    if (e.key === 'Escape') setAberto(false);
  }

  function aoDigitar(valor: string) {
    setTexto(valor);

    setAberto(true);

    setDestaque(0);
  }

  function aoSair() {
    window.setTimeout(() => {
      if (texto.trim()) adicionar(texto);

      setAberto(false);
    }, ESPERA_AO_SAIR);
  }

  const dica = (value.length > 0)
    ? ''
    : 'Digite e pressione Enter';

  return (
    <div className="position-relative">
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
          role="combobox"
          aria-expanded={listaVisivel}
          aria-controls={listaId}
          aria-autocomplete="list"
          onChange={(e) => aoDigitar(e.target.value)}
          onKeyDown={aoTeclar}
          onBlur={aoSair}
        />
      </div>

      {listaVisivel && (
        <ul
          id={listaId}
          role="listbox"
          className={classes(
            'dropdown-menu',
            'show',
            'w-100',
            'mt-1',
          )}
        >
          {opcoes.map((nome, indice) => (
            <li
              key={nome}
              role="option"
              aria-selected={indice === destaque}
            >
              <button
                type="button"
                className={classes(
                  'dropdown-item',
                  'd-flex',
                  'align-items-center',
                  'gap-2',
                  indice === destaque && 'active',
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => adicionar(nome)}
              >
                <i className="bi bi-person" aria-hidden="true" />

                {nome}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
