import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { errosDeValidacao, mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { admin } from '../api/servicos';
import type { Leitor, LeitorPayload } from '../api/tipos';
import { classes } from '../utilitarios/classes';
import { mascararCep, mascararCpf } from '../utilitarios/mascaras';
import { cpfValido, somenteDigitos, UFS } from '../utilitarios/validadores';
import { Campo } from './Campo';
import { Modal } from './Modal';
import { useToast } from './toastContexto';

interface Props {
  leitor: Leitor | null;
  aoFechar: () => void;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function ufValida(valor: string): boolean {
  const ufs: readonly string[] = UFS;

  return ufs.includes(valor);
}

const esquema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo.').max(150),
  email: z.email('Informe um e-mail válido.').max(255),
  cpf: z.string().refine(cpfValido, 'CPF inválido.'),
  data_nascimento: z
    .string()
    .refine((v) => v > '1900-01-01' && v < hoje(), 'Data inválida (deve estar no passado).'),
  cep: z.string().refine((v) => somenteDigitos(v).length === 8, 'CEP com 8 dígitos.'),
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

type Dados = z.infer<typeof esquema>;

const CAMPOS = Object.keys(esquema.shape) as Array<keyof Dados>;

function valoresIniciais(leitor: Leitor): Dados {
  return {
    nome: leitor.nome,
    email: leitor.email,
    cpf: mascararCpf(leitor.cpf ?? ''),
    data_nascimento: leitor.data_nascimento ?? '',
    cep: mascararCep(leitor.cep ?? ''),
    uf: leitor.uf ?? '',
    cidade: leitor.cidade ?? '',
    bairro: leitor.bairro ?? '',
    rua: leitor.rua ?? '',
    numero: leitor.numero ?? '',
    complemento: leitor.complemento ?? '',
  };
}

function paraPayload(dados: Dados): LeitorPayload {
  const complemento = dados.complemento.trim();

  return {
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    cpf: somenteDigitos(dados.cpf),
    data_nascimento: dados.data_nascimento,
    cep: somenteDigitos(dados.cep),
    uf: dados.uf,
    cidade: dados.cidade.trim(),
    bairro: dados.bairro.trim(),
    rua: dados.rua.trim(),
    numero: dados.numero.trim().toUpperCase(),
    complemento: complemento || null,
  };
}

function Formulario({ leitor, aoFechar }: { leitor: Leitor; aoFechar: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: valoresIniciais(leitor),
  });

  const salvar = useMutation({
    mutationFn: (dados: Dados) => admin.atualizarUsuario(leitor.id, paraPayload(dados)),

    onSuccess: () => {
      toast.sucesso('Dados do leitor atualizados.');

      qc.invalidateQueries({ queryKey: queryKeys.leitores.todos });
      qc.invalidateQueries({ queryKey: queryKeys.reservas.todas });
      qc.invalidateQueries({ queryKey: queryKeys.emprestimos.todos });
      qc.invalidateQueries({ queryKey: queryKeys.painel });

      aoFechar();
    },

    onError: (erro) => {
      const porCampo = errosDeValidacao(erro);
      let marcouCampo = false;

      for (const campo of CAMPOS) {
        if (porCampo[campo]) {
          setError(campo, { message: porCampo[campo] });
          marcouCampo = true;
        }
      }

      if (!marcouCampo) toast.erro(mensagemDeErro(erro));
    },
  });

  const pendente = salvar.isPending;
  const enviar = handleSubmit((dados) => salvar.mutate(dados));

  function entrada(campo: keyof Dados, extras: Record<string, string> = {}) {
    return (
      <input
        id={`leitor-${campo}`}
        className={classes('form-control', errors[campo] && 'is-invalid')}
        {...extras}
        {...register(campo)}
      />
    );
  }

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Editar leitor"
      bloqueado={pendente}
      tamanho="grande"
      rodape={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pendente}
            onClick={aoFechar}
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="form-editar-leitor"
            className="btn btn-primary"
            disabled={pendente || !isDirty}
          >
            {pendente && (
              <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            )}
            Salvar alterações
          </button>
        </>
      }
    >
      <form id="form-editar-leitor" noValidate onSubmit={enviar}>
        <h3 className="h6 text-body-secondary">Dados pessoais</h3>

        <div className="row g-3 mb-4">
          <Campo className="col-12" rotulo="Nome" htmlFor="leitor-nome" erro={errors.nome?.message}>
            {entrada('nome', { autoComplete: 'off' })}
          </Campo>

          <Campo className="col-md-6" rotulo="E-mail" htmlFor="leitor-email" erro={errors.email?.message}>
            {entrada('email', { type: 'email', autoComplete: 'off' })}
          </Campo>

          <Campo className="col-md-3" rotulo="CPF" htmlFor="leitor-cpf" erro={errors.cpf?.message}>
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <input
                  id="leitor-cpf"
                  inputMode="numeric"
                  className={classes('form-control', errors.cpf && 'is-invalid')}
                  placeholder="000.000.000-00"
                  value={field.value}
                  onChange={(e) => field.onChange(mascararCpf(e.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Campo>

          <Campo
            className="col-md-3"
            rotulo="Nascimento"
            htmlFor="leitor-data_nascimento"
            erro={errors.data_nascimento?.message}
          >
            {entrada('data_nascimento', { type: 'date', max: hoje() })}
          </Campo>
        </div>

        <h3 className="h6 text-body-secondary">Endereço</h3>

        <div className="row g-3">
          <Campo className="col-sm-4" rotulo="CEP" htmlFor="leitor-cep" erro={errors.cep?.message}>
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <input
                  id="leitor-cep"
                  inputMode="numeric"
                  className={classes('form-control', errors.cep && 'is-invalid')}
                  placeholder="00000-000"
                  value={field.value}
                  onChange={(e) => field.onChange(mascararCep(e.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Campo>

          <Campo className="col-sm-2" rotulo="UF" htmlFor="leitor-uf" erro={errors.uf?.message}>
            <select
              id="leitor-uf"
              className={classes('form-select', errors.uf && 'is-invalid')}
              {...register('uf')}
            >
              <option value="">—</option>

              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Campo>

          <Campo className="col-sm-6" rotulo="Cidade" htmlFor="leitor-cidade" erro={errors.cidade?.message}>
            {entrada('cidade')}
          </Campo>

          <Campo className="col-sm-5" rotulo="Bairro" htmlFor="leitor-bairro" erro={errors.bairro?.message}>
            {entrada('bairro')}
          </Campo>

          <Campo className="col-sm-7" rotulo="Rua" htmlFor="leitor-rua" erro={errors.rua?.message}>
            {entrada('rua')}
          </Campo>

          <Campo
            className="col-sm-4"
            rotulo="Número"
            htmlFor="leitor-numero"
            erro={errors.numero?.message}
            dica="Use S/N se não houver."
          >
            {entrada('numero')}
          </Campo>

          <Campo
            className="col-sm-8"
            rotulo="Complemento (opcional)"
            htmlFor="leitor-complemento"
            erro={errors.complemento?.message}
          >
            {entrada('complemento')}
          </Campo>
        </div>
      </form>
    </Modal>
  );
}

export function EditarLeitorModal({ leitor, aoFechar }: Props) {
  if (!leitor) return null;

  return <Formulario key={leitor.id} leitor={leitor} aoFechar={aoFechar} />;
}
