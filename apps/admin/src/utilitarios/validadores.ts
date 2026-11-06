export function somenteDigitos(valor: string | null | undefined): string {
  const texto = valor ?? '';

  return texto.replace(/\D/g, '');
}

export function limparIsbn(valor: string | null | undefined): string {
  const texto = valor ?? '';
  const maiusculo = texto.toUpperCase();

  return maiusculo.replace(/[^0-9X]/g, '');
}

function isbn10Valido(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;

  let soma = 0;

  for (let i = 0; i < 10; i++) {
    const digito = (isbn[i] === 'X')
      ? 10
      : Number(isbn[i]);

    soma += digito * (10 - i);
  }

  return soma % 11 === 0;
}

function digitoIsbn13(base: string): number {
  let soma = 0;

  for (let i = 0; i < 12; i++) {
    const peso = (i % 2 === 0) ? 1 : 3;

    soma += Number(base[i]) * peso;
  }

  return (10 - (soma % 10)) % 10;
}

function isbn13Valido(isbn: string): boolean {
  if (!/^97[89]\d{10}$/.test(isbn)) return false;

  const digitoInformado = Number(isbn[12]);

  return digitoIsbn13(isbn) === digitoInformado;
}

export function isbnValido(valor: string | null | undefined): boolean {
  const isbn = limparIsbn(valor);

  if (isbn.length === 10) return isbn10Valido(isbn);

  if (isbn.length === 13) return isbn13Valido(isbn);

  return false;
}

export function normalizarIsbn(valor: string | null | undefined): string | null {
  const isbn = limparIsbn(valor);

  if (isbn.length === 13 && isbn13Valido(isbn)) return isbn;

  if (isbn.length === 10 && isbn10Valido(isbn)) {
    const noveDigitos = isbn.slice(0, 9);
    const base = `978${noveDigitos}`;
    const digito = digitoIsbn13(base);

    return `${base}${digito}`;
  }

  return null;
}
