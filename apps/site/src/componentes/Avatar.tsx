import { classes } from '../utilitarios/classes';

interface Props {
  nome: string;
  url?: string | null;
  grande?: boolean;
}

function iniciais(nome: string): string {
  const semEspacos = nome.trim();
  const palavras = semEspacos.split(/\s+/);
  const partes = palavras.filter(Boolean);

  const primeiraLetra = partes[0]?.[0] ?? '';

  const ultimaLetra = (partes.length > 1)
    ? partes[partes.length - 1][0]
    : '';

  const letras = primeiraLetra + ultimaLetra;

  return letras.toUpperCase();
}

export function Avatar({ nome, url, grande = false }: Props) {
  const tamanho = grande
    ? 72
    : 32;

  const dimensoes = { width: tamanho, height: tamanho };

  if (url) {
    return (
      <img
        className={classes(
          'rounded-circle',
          'object-fit-cover',
          'flex-shrink-0',
        )}
        style={dimensoes}
        src={url}
        alt={`Foto de ${nome}`}
      />
    );
  }

  return (
    <span
      className={classes(
        'rounded-circle',
        'text-bg-primary',
        'd-inline-flex',
        'align-items-center',
        'justify-content-center',
        'fw-semibold',
        'flex-shrink-0',
        grande ? 'fs-4' : 'small',
      )}
      style={dimensoes}
      aria-hidden="true"
    >
      {iniciais(nome)}
    </span>
  );
}
