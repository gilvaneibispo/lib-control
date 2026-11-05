export function listarAutores(autores: string[] | undefined): string {
  if (!autores || autores.length === 0)
    return 'Autor não informado';

  if (autores.length <= 2)
    return autores.join(' e ');

  const primeiros = autores.slice(0, 2);
  const nomes = primeiros.join(', ');

  return `${nomes} e outros`;
}
