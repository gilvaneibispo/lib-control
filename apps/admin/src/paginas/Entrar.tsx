import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { mensagemDeErro } from '../api/erros';
import { auth } from '../api/servicos';
import { Campo } from '../componentes/Campo';
import { useDefinirSessao, useSessao } from '../sessao';
import { classes } from '../utilitarios/classes';

const esquema = z.object({
  email: z.email('Informe um e-mail válido.'),

  password: z.string().min(1, 'Informe a senha.'),
});

type Dados = z.infer<typeof esquema>;

type EstadoNavegacao = { de?: string } | null;

export function Entrar() {
  const { data: sessao } = useSessao();
  const definirSessao = useDefinirSessao();
  const navegar = useNavigate();
  const local = useLocation();

  const [erro, setErro] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<Dados>({
    resolver: zodResolver(esquema),
  });

  const erros = formState.errors;
  const estado = local.state as EstadoNavegacao;
  const destino = estado?.de ?? '/';

  if (sessao) return <Navigate to="/" replace />;

  async function enviar(dados: Dados) {
    setErro(null);

    try {
      const novaSessao = await auth.login(dados.email, dados.password);

      definirSessao(novaSessao);

      navegar(destino, { replace: true });
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <main
      className={classes(
        'min-vh-100',
        'd-flex',
        'align-items-center',
        'justify-content-center',
        'p-3',
      )}
    >
      <div className="card w-100" style={{ maxWidth: 380 }}>
        <div className="card-header">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-book-half fs-4 text-primary" aria-hidden="true" />

            <span className="fw-semibold">LibControl · Administração</span>
          </div>

          <h1 className="h5 mb-1">Entrar</h1>

          <p className="small text-body-secondary mb-0">
            Acesso restrito à equipe da biblioteca.
          </p>
        </div>

        <div className="card-body">
          <form
            className="d-flex flex-column gap-3"
            onSubmit={handleSubmit(enviar)}
            noValidate
          >
            <Campo rotulo="E-mail" htmlFor="email" erro={erros.email?.message}>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className={classes('form-control', erros.email && 'is-invalid')}
                {...register('email')}
              />
            </Campo>

            <Campo rotulo="Senha" htmlFor="senha" erro={erros.password?.message}>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                className={classes('form-control', erros.password && 'is-invalid')}
                {...register('password')}
              />
            </Campo>

            {erro && (
              <div className="alert alert-danger py-2 mb-0" role="alert">
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
              )}
              Entrar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
