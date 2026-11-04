export function classes(...lista: Array<string | false | null | undefined>): string {
  return lista.filter(Boolean).join(' ');
}
