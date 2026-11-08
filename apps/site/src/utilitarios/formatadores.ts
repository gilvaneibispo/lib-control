import { parse } from 'isbn3';

const TZ = 'America/Bahia';

const dataCurta = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TZ,
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});

const dataCompleta = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TZ,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function formatarDiaSemana(iso: string | null | undefined): string {
  if (!iso) return '—';

  const data = new Date(iso);
  const formatada = dataCurta.format(data);

  return formatada.replace('.', '');
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—';

  const data = new Date(iso);

  return dataCompleta.format(data);
}

export function textoPrazo(diasRestantes: number | null | undefined): string {
  if (diasRestantes === null || diasRestantes === undefined) return '';

  if (diasRestantes < 0) {
    const atraso = Math.abs(diasRestantes);
    const unidade = (atraso === 1)
      ? 'dia'
      : 'dias';

    return `${atraso} ${unidade} de atraso`;
  }

  if (diasRestantes === 0) return 'vence hoje';

  if (diasRestantes === 1) return 'vence amanhã';

  return `${diasRestantes} dias restantes`;
}

export function listarAutores(autores: string[] | undefined): string {
  if (!autores || autores.length === 0) return 'Autor não informado';

  if (autores.length <= 2) return autores.join(' e ');

  const primeiros = autores.slice(0, 2);
  const nomes = primeiros.join(', ');

  return `${nomes} e outros`;
}

export function formatarIsbn(isbn: string | null | undefined): string {
  const valor = isbn ?? '';
  const analisado = parse(valor);

  if (!analisado) return valor;

  if (analisado.isIsbn10 && analisado.isbn10h) return analisado.isbn10h;

  return analisado.isbn13h;
}
