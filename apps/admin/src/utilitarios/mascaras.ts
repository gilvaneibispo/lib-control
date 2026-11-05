export function mascararIsbn(valor: string): string {
  const maiusculo = valor.toUpperCase();
  const permitidos = maiusculo.replace(/[^0-9X-]/g, '');
  const semHifensRepetidos = permitidos.replace(/-{2,}/g, '-');

  return semHifensRepetidos.slice(0, 17);
}
