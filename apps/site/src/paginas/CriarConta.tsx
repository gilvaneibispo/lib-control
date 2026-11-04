import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { errosDeValidacao, mensagemDeErro } from '../api/erros';
import { auth } from '../api/servicos';
import { Campo } from '../componentes/Campo';
import { EnderecoCampos } from '../componentes/EnderecoCampos';
import { SeletorArquivo } from '../componentes/SeletorArquivo';
import { useToast } from '../componentes/toastContexto';
import { esquemaDadosPessoais, esquemaEndereco } from '../esquemas';
import { useDefinirSessao, useSessao } from '../sessao';
import { classes } from '../utilitarios/classes';
import { dataParaIso, mascararCpf, mascararData } from '../utilitarios/mascaras';
import { somenteDigitos } from '../utilitarios/validadores';

const esquema = esquemaDadosPessoais.and(esquemaEndereco);

type DadosPessoais = z.infer<typeof esquemaDadosPessoais>;

type DadosEndereco = z.infer<typeof esquemaEndereco>;

type Dados = DadosPessoais & DadosEndereco;

type EstadoNavegacao = { de?: string } | null;

const PASSO_1 = [
  'nome',
  'email',
  'password',
  'password_confirmation',
  'cpf',
  'data_nascimento',
] as const;

const CAMPOS_PASSO_1: readonly string[] = [...PASSO_1, 'foto'];

const TRES_MB = 3 * 1024 * 1024;

const VALORES_INICIAIS: Dados = {
  nome: '',
  email: '',
  password: '',
  password_confirmation: '',
  cpf: '',
  data_nascimento: '',
  cep: '',
  uf: '',
  cidade: '',
  bairro: '',
  rua: '',
  numero: '',
  complemento: '',
};

function montarFormulario(dados: Dados, foto: File | null): FormData {
  const form = new FormData();

  const valores: Record<string, string> = {
    ...dados,
    cpf: somenteDigitos(dados.cpf),
    cep: somenteDigitos(dados.cep),
    data_nascimento: dataParaIso(dados.data_nascimento) ?? '',
  };

  for (const [chave, valor] of Object.entries(valores)) {
    form.append(chave, valor);
  }

  if (foto) form.append('foto', foto);

  return form;
}

export function CriarConta() {
  const { data: sessao } = useSessao();
  const definirSessao = useDefinirSessao();
  const navegar = useNavigate();
  const local = useLocation();
  const toast = useToast();

  const [passo, setPasso] = useState<1 | 2>(1);
  const [foto, setFoto] = useState<File | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  const formulario = useForm<Dados>({
    resolver: zodResolver(esquema),
    mode: 'onTouched',
    defaultValues: VALORES_INICIAIS,
  });

  const { register, control, handleSubmit, trigger, setValue, setError, formState } = formulario;
  const erros = formState.errors;

  if (sessao) return <Navigate to="/catalogo" replace />;

  async function avancar() {
    const passoValido = await trigger(PASSO_1);

    if (passoValido) setPasso(2);
  }

  function aplicarErros(campos: Record<string, string>) {
    for (const [campo, mensagem] of Object.entries(campos)) {
      if (campo === 'foto') setErroFoto(mensagem);
      else setError(campo as keyof Dados, { message: mensagem });
    }

    const nomesComErro = Object.keys(campos);
    const erroNoPasso1 = nomesComErro.some((campo) => CAMPOS_PASSO_1.includes(campo));

    if (erroNoPasso1) setPasso(1);
  }

  async function enviar(dados: Dados) {
    const form = montarFormulario(dados, foto);

    try {
      const novaSessao = await auth.registrar(form);

      definirSessao(novaSessao);

      toast.sucesso('Conta criada. Boas leituras!');

      const estado = local.state as EstadoNavegacao;
      const destino = estado?.de ?? '/catalogo';

      navegar(destino, { replace: true });
    } catch (e) {
      const campos = errosDeValidacao(e);

      aplicarErros(campos);

      toast.erro(mensagemDeErro(e));
    }
  }

  function trocarFoto(arquivo: File | null) {
    setErroFoto(null);
    setFoto(arquivo);
  }

  const titulo = (passo === 1)
    ? 'Criar conta'
    : 'Endereço';

  const descricao = (passo === 1)
    ? 'Seus dados pessoais e uma foto para a carteirinha.'
    : 'Digite o CEP para preencher o endereço automaticamente.';

  const progresso = (passo === 1)
    ? '50%'
    : '100%';

  return (
    <div className="card mx-auto" style={{ maxWidth: 620 }}>
      <div className="card-header">
        <span className="small text-body-secondary">Passo {passo} de 2</span>

        <h1 className="h5 mb-1">{titulo}</h1>

        <p className="small text-body-secondary mb-2">{descricao}</p>

        <div
          className="progress"
          style={{ height: 4 }}
          role="progressbar"
          aria-label="Progresso do cadastro"
          aria-valuenow={passo}
          aria-valuemin={1}
          aria-valuemax={2}
        >
          <div className="progress-bar" style={{ width: progresso }} />
        </div>
      </div>

      <div className="card-body">
        <form
          className="d-flex flex-column gap-3"
          onSubmit={handleSubmit(enviar)}
          noValidate
        >
          <div
            className={classes(
              'd-flex',
              'flex-column',
              'gap-3',
              passo !== 1 && 'd-none',
            )}
          >
            <Campo rotulo="Nome completo" htmlFor="nome" erro={erros.nome?.message}>
              <input
                id="nome"
                autoComplete="name"
                className={classes('form-control', erros.nome && 'is-invalid')}
                {...register('nome')}
              />
            </Campo>

            <div className="row g-3">
              <div className="col-sm-6">
                <Campo rotulo="CPF" htmlFor="cpf" erro={erros.cpf?.message}>
                  <Controller
                    control={control}
                    name="cpf"
                    render={({ field }) => (
                      <input
                        id="cpf"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        className={classes('form-control', erros.cpf && 'is-invalid')}
                        value={field.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const mascarado = mascararCpf(e.target.value);

                          field.onChange(mascarado);
                        }}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Campo>
              </div>

              <div className="col-sm-6">
                <Campo
                  rotulo="Data de nascimento"
                  htmlFor="nasc"
                  erro={erros.data_nascimento?.message}
                >
                  <Controller
                    control={control}
                    name="data_nascimento"
                    render={({ field }) => (
                      <input
                        id="nasc"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        autoComplete="bday"
                        className={classes(
                          'form-control',
                          erros.data_nascimento && 'is-invalid',
                        )}
                        value={field.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const mascarado = mascararData(e.target.value);

                          field.onChange(mascarado);
                        }}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </Campo>
              </div>
            </div>

            <Campo rotulo="E-mail" htmlFor="email" erro={erros.email?.message}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={classes('form-control', erros.email && 'is-invalid')}
                {...register('email')}
              />
            </Campo>

            <div className="row g-3">
              <div className="col-sm-6">
                <Campo
                  rotulo="Senha"
                  htmlFor="senha"
                  erro={erros.password?.message}
                  dica="Mínimo de 8 caracteres."
                >
                  <input
                    id="senha"
                    type="password"
                    autoComplete="new-password"
                    className={classes('form-control', erros.password && 'is-invalid')}
                    {...register('password')}
                  />
                </Campo>
              </div>

              <div className="col-sm-6">
                <Campo
                  rotulo="Confirme a senha"
                  htmlFor="senha2"
                  erro={erros.password_confirmation?.message}
                >
                  <input
                    id="senha2"
                    type="password"
                    autoComplete="new-password"
                    className={classes(
                      'form-control',
                      erros.password_confirmation && 'is-invalid',
                    )}
                    {...register('password_confirmation')}
                  />
                </Campo>
              </div>
            </div>

            <Campo rotulo="Foto (opcional)" erro={erroFoto ?? undefined}>
              <SeletorArquivo
                value={foto}
                onChange={trocarFoto}
                maxBytes={TRES_MB}
                aoErrar={setErroFoto}
                invalido={Boolean(erroFoto)}
                titulo="Arraste sua foto ou clique para escolher"
                dica="JPG ou PNG até 3 MB"
              />
            </Campo>

            <button type="button" className="btn btn-primary" onClick={avancar}>
              Continuar
              <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
            </button>
          </div>

          <div
            className={classes(
              'd-flex',
              'flex-column',
              'gap-3',
              passo !== 2 && 'd-none',
            )}
          >
            <EnderecoCampos
              control={control}
              register={register}
              setValue={setValue}
              errors={erros}
            />

            <div className="d-flex justify-content-between gap-2">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={() => setPasso(1)}
              >
                <i className="bi bi-arrow-left me-2" aria-hidden="true" />
                Voltar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting && (
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                )}
                Criar conta
              </button>
            </div>
          </div>

          <p className="small text-body-secondary text-center m-0">
            Já tem conta? <Link to="/entrar">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
