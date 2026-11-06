import { somenteDigitos } from './validadores';

export function mascararIsbn(valor: string): string {
  const maiusculo = valor.toUpperCase();
  const permitidos = maiusculo.replace(/[^0-9X-]/g, '');
  const semHifensRepetidos = permitidos.replace(/-{2,}/g, '-');

  return semHifensRepetidos.slice(0, 17);
}

export function ocultarCpf(cpf: string | null | undefined): string {
  const digitos = somenteDigitos(cpf);

  if (digitos.length !== 11) return '—';

  const meio = digitos.slice(3, 6);
  const fim = digitos.slice(6, 9);

  return `***.${meio}.${fim}-**`;
}
