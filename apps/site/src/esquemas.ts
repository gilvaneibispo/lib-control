import { z } from 'zod';
import { dataParaIso } from './utilitarios/mascaras';
import { cpfValido, somenteDigitos, UFS } from './utilitarios/validadores';

function cepCompleto(valor: string): boolean {
  const digitos = somenteDigitos(valor);

  return digitos.length === 8;
}

function ufValida(valor: string): boolean {
  const ufs: readonly string[] = UFS;

  return ufs.includes(valor);
}

function dataNascimentoValida(valor: string): boolean {
  const iso = dataParaIso(valor);

  if (!iso) return false;

  const agora = new Date();
  const hoje = agora.toISOString().slice(0, 10);

  return iso < hoje && iso > '1900-01-01';
}

export const esquemaEndereco = z.object({
  cep: z.string().refine(cepCompleto, 'CEP com 8 dígitos.'),

  uf: z.string().refine(ufValida, 'Escolha a UF.'),

  cidade: z.string().trim().min(1, 'Informe a cidade.').max(100),

  bairro: z.string().trim().min(1, 'Informe o bairro.').max(100),

  rua: z.string().trim().min(1, 'Informe a rua.').max(150),

  numero: z
    .string()
    .trim()
    .min(1, 'Informe o número.')
    .max(10)
    .regex(/^(\d+[A-Za-z]?|S\/N)$/i, 'Use apenas o número ou S/N.'),

  complemento: z.string().max(100),
});

export const campoDataNascimento = z
  .string()
  .refine(dataNascimentoValida, 'Data inválida (dd/mm/aaaa, no passado).');

const camposDadosPessoais = z.object({
  nome: z.string().trim().min(3, 'Informe seu nome completo.').max(150),

  email: z.email('Informe um e-mail válido.'),

  password: z.string().min(8, 'A senha precisa de ao menos 8 caracteres.'),

  password_confirmation: z.string(),

  cpf: z.string().refine(cpfValido, 'CPF inválido.'),

  data_nascimento: campoDataNascimento,
});

type DadosPessoais = z.infer<typeof camposDadosPessoais>;

function senhasConferem(dados: DadosPessoais): boolean {
  return dados.password === dados.password_confirmation;
}

export const esquemaDadosPessoais = camposDadosPessoais.refine(senhasConferem, {
  message: 'As senhas não conferem.',
  path: ['password_confirmation'],
});
