export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export function somenteDigitos(valor: string | null | undefined): string {
  const texto = valor ?? '';

  return texto.replace(/\D/g, '');
}

export function cpfValido(valor: string | null | undefined): boolean {
  const cpf = somenteDigitos(valor);
  const tamanhoInvalido = cpf.length !== 11;
  const digitosRepetidos = /^(\d)\1{10}$/.test(cpf);

  if (tamanhoInvalido || digitosRepetidos) return false;

  for (const posicao of [9, 10]) {
    let soma = 0;

    for (let i = 0; i < posicao; i++) {
      soma += Number(cpf[i]) * (posicao + 1 - i);
    }

    const digitoCalculado = ((soma * 10) % 11) % 10;
    const digitoInformado = Number(cpf[posicao]);

    if (digitoCalculado !== digitoInformado) return false;
  }

  return true;
}
