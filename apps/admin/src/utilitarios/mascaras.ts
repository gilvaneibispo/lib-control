import { formatarIsbn } from './formatadores';
import { limparIsbn, somenteDigitos } from './validadores';

export function mascararIsbn(valor: string): string {
  const limpo = limparIsbn(valor);
  const ateTrezeDigitos = limpo.slice(0, 13);

  return formatarIsbn(ateTrezeDigitos);
}

export function mascararCpf(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 11);

  const comPrimeiroPonto = digitos.replace(/^(\d{3})(\d)/, '$1.$2');
  const comSegundoPonto = comPrimeiroPonto.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');

  return comSegundoPonto.replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function ocultarCpf(cpf: string | null | undefined): string {
  const digitos = somenteDigitos(cpf);

  if (digitos.length !== 11) return '—';

  const meio = digitos.slice(3, 6);
  const fim = digitos.slice(6, 9);

  return `***.${meio}.${fim}-**`;
}

export function mascararCep(valor: string): string {
  const digitos = somenteDigitos(valor).slice(0, 8);

  if (digitos.length <= 5) return digitos;

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}
