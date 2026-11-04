import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { errosDeValidacao, mensagemDeErro } from '../api/erros';
import { leitor } from '../api/servicos';
import type { Usuario } from '../api/tipos';
import { Avatar } from '../componentes/Avatar';
import { CabecalhoPagina } from '../componentes/CabecalhoPagina';
import { Campo } from '../componentes/Campo';
import { EnderecoCampos } from '../componentes/EnderecoCampos';
import { SeletorArquivo } from '../componentes/SeletorArquivo';
import { useToast } from '../componentes/toastContexto';
import { campoDataNascimento, esquemaEndereco } from '../esquemas';
import { useRecarregarSessao, useSessao } from '../sessao';
import { classes } from '../utilitarios/classes';
import {
  dataParaIso,
  isoParaData,
  mascararCep,
  mascararCpf,
  mascararData,
} from '../utilitarios/mascaras';
import { somenteDigitos } from '../utilitarios/validadores';

const camposPerfil = z.object({
  nome: z.string().trim().min(3, 'Informe seu nome completo.').max(150),

  email: z.email('Informe um e-mail válido.'),

  data_nascimento: campoDataNascimento,
});

const esquemaPerfil = camposPerfil.and(esquemaEndereco);

type DadosPerfil = z.infer<typeof esquemaPerfil>;

const camposSenha = z.object({
  senha_atual: z.string().min(1, 'Informe a senha atual.'),

  password: z.string().min(8, 'A nova senha precisa de ao menos 8 caracteres.'),

  password_confirmation: z.string(),
});

type DadosSenha = z.infer<typeof camposSenha>;

function senhasConferem(dados: DadosSenha): boolean {
  return dados.password === dados.password_confirmation;
}

const esquemaSenha = camposSenha.refine(senhasConferem, {
  message: 'As senhas não conferem.',
  path: ['password_confirmation'],
});

const SENHA_VAZIA: DadosSenha = {
  senha_atual: '',
  password: '',
  password_confirmation: '',
};

const TRES_MB = 3 * 1024 * 1024;

function valoresIniciais(usuario: Usuario): DadosPerfil {
  return {
    nome: usuario.nome,
    email: usuario.email,
    data_nascimento: isoParaData(usuario.data_nascimento),
    cep: mascararCep(usuario.cep ?? ''),
    uf: usuario.uf ?? '',
    cidade: usuario.cidade ?? '',
    bairro: usuario.bairro ?? '',
    rua: usuario.rua ?? '',
    numero: usuario.numero ?? '',
    complemento: usuario.complemento ?? '',
  };
}

function paraEnvio(dados: DadosPerfil) {
  return {
    ...dados,
    cep: somenteDigitos(dados.cep),
    data_nascimento: dataParaIso(dados.data_nascimento),
    complemento: dados.complemento || null,
  };
}

function Spinner() {
  return <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />;
}

export function Perfil() {
  const { data: sessao } = useSessao();

  if (!sessao) return null;

  return <FormularioPerfil usuario={sessao.data} />;
}

function FormularioPerfil({ usuario }: { usuario: Usuario }) {
  const recarregar = useRecarregarSessao();
  const toast = useToast();

  const [foto, setFoto] = useState<File | null>(null);
  const [erroFoto, setErroFoto] = useState<string | null>(null);

  const perfil = useForm<DadosPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: valoresIniciais(usuario),
  });

  const senha = useForm<DadosSenha>({
    resolver: zodResolver(esquemaSenha),
    defaultValues: SENHA_VAZIA,
  });

  const salvarPerfil = useMutation({
    mutationFn: (dados: DadosPerfil) => leitor.atualizar(paraEnvio(dados)),

    onSuccess: () => {
      toast.sucesso('Dados atualizados.');

      recarregar();
    },

    onError: (erro) => {
      const campos = errosDeValidacao(erro);

      for (const [campo, mensagem] of Object.entries(campos)) {
        perfil.setError(campo as keyof DadosPerfil, { message: mensagem });
      }

      toast.erro(mensagemDeErro(erro));
    },
  });

  const salvarSenha = useMutation({
    mutationFn: (dados: DadosSenha) => leitor.atualizar(dados),

    onSuccess: () => {
      toast.sucesso('Senha alterada.');

      senha.reset();
    },

    onError: (erro) => {
      const campos = errosDeValidacao(erro);

      for (const [campo, mensagem] of Object.entries(campos)) {
        senha.setError(campo as keyof DadosSenha, { message: mensagem });
      }
    },
  });

  const salvarFoto = useMutation({
    mutationFn: (arquivo: File) => leitor.foto(arquivo),

    onSuccess: () => {
      toast.sucesso('Foto atualizada.');

      setFoto(null);

      recarregar();
    },

    onError: (erro) => setErroFoto(mensagemDeErro(erro)),
  });

  const enviarPerfil = perfil.handleSubmit((dados) => salvarPerfil.mutate(dados));

  const enviarSenha = senha.handleSubmit((dados) => salvarSenha.mutate(dados));

  function trocarFoto(arquivo: File | null) {
    setErroFoto(null);
    setFoto(arquivo);
  }

  function enviarFoto() {
    if (foto) salvarFoto.mutate(foto);
  }

  const ep = perfil.formState.errors;
  const es = senha.formState.errors;

  return (
    <>
      <CabecalhoPagina
        titulo="Perfil"
        descricao="Mantenha seus dados atualizados."
        acoes={
          <button
            type="button"
            className="btn btn-primary"
            disabled={salvarPerfil.isPending}
            onClick={enviarPerfil}
          >
            {salvarPerfil.isPending
              ? <Spinner />
              : <i className="bi bi-check2 me-2" aria-hidden="true" />}
            Salvar dados
          </button>
        }
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h2 className="h6 m-0">Dados pessoais e endereço</h2>
            </div>

            <div className="card-body">
              <form className="d-flex flex-column gap-3" noValidate onSubmit={enviarPerfil}>
                <Campo rotulo="Nome completo" htmlFor="nome" erro={ep.nome?.message}>
                  <input
                    id="nome"
                    className={classes('form-control', ep.nome && 'is-invalid')}
                    {...perfil.register('nome')}
                  />
                </Campo>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <Campo rotulo="E-mail" htmlFor="email" erro={ep.email?.message}>
                      <input
                        id="email"
                        type="email"
                        className={classes('form-control', ep.email && 'is-invalid')}
                        {...perfil.register('email')}
                      />
                    </Campo>
                  </div>

                  <div className="col-sm-3">
                    <Campo rotulo="CPF" htmlFor="cpf" dica="Não editável.">
                      <input
                        id="cpf"
                        className="form-control"
                        readOnly
                        value={mascararCpf(usuario.cpf ?? '')}
                      />
                    </Campo>
                  </div>

                  <div className="col-sm-3">
                    <Campo
                      rotulo="Nascimento"
                      htmlFor="nasc"
                      erro={ep.data_nascimento?.message}
                    >
                      <Controller
                        control={perfil.control}
                        name="data_nascimento"
                        render={({ field }) => (
                          <input
                            id="nasc"
                            inputMode="numeric"
                            className={classes(
                              'form-control',
                              ep.data_nascimento && 'is-invalid',
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

                <EnderecoCampos
                  control={perfil.control}
                  register={perfil.register}
                  setValue={perfil.setValue}
                  errors={ep}
                />

                <button type="submit" className="visually-hidden" tabIndex={-1}>
                  Salvar
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">
          <div className="card">
            <div className="card-header">
              <h2 className="h6 m-0">Foto</h2>
            </div>

            <div
              className={classes(
                'card-body',
                'd-flex',
                'flex-column',
                'gap-3',
              )}
            >
              <div className="d-flex align-items-center gap-3">
                <Avatar nome={usuario.nome} url={usuario.foto_url} grande />

                <span className="small text-body-secondary">
                  JPG ou PNG até 3 MB. Recortada em quadrado.
                </span>
              </div>

              <SeletorArquivo
                value={foto}
                onChange={trocarFoto}
                maxBytes={TRES_MB}
                aoErrar={setErroFoto}
                invalido={Boolean(erroFoto)}
              />

              {erroFoto && <div className="invalid-feedback d-block">{erroFoto}</div>}

              <button
                type="button"
                className="btn btn-secondary"
                disabled={!foto || salvarFoto.isPending}
                onClick={enviarFoto}
              >
                {salvarFoto.isPending
                  ? <Spinner />
                  : <i className="bi bi-cloud-arrow-up me-2" aria-hidden="true" />}
                Enviar foto
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="h6 m-0">Senha</h2>
            </div>

            <div className="card-body">
              <form className="d-flex flex-column gap-3" noValidate onSubmit={enviarSenha}>
                <Campo rotulo="Senha atual" htmlFor="atual" erro={es.senha_atual?.message}>
                  <input
                    id="atual"
                    type="password"
                    autoComplete="current-password"
                    className={classes('form-control', es.senha_atual && 'is-invalid')}
                    {...senha.register('senha_atual')}
                  />
                </Campo>

                <Campo rotulo="Nova senha" htmlFor="nova" erro={es.password?.message}>
                  <input
                    id="nova"
                    type="password"
                    autoComplete="new-password"
                    className={classes('form-control', es.password && 'is-invalid')}
                    {...senha.register('password')}
                  />
                </Campo>

                <Campo
                  rotulo="Confirme a nova senha"
                  htmlFor="nova2"
                  erro={es.password_confirmation?.message}
                >
                  <input
                    id="nova2"
                    type="password"
                    autoComplete="new-password"
                    className={classes(
                      'form-control',
                      es.password_confirmation && 'is-invalid',
                    )}
                    {...senha.register('password_confirmation')}
                  />
                </Campo>

                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={salvarSenha.isPending}
                >
                  {salvarSenha.isPending && <Spinner />}
                  Alterar senha
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
