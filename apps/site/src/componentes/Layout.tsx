import { useQueryClient } from '@tanstack/react-query';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../api/servicos';
import type { Sessao } from '../api/tipos';
import { useSessao } from '../sessao';
import { classes } from '../utilitarios/classes';
import { Avatar } from './Avatar';
import { BuscaCatalogo } from './BuscaCatalogo';

interface ItemMenu {
  rota: string;
  icone: string;
  rotulo: string;
}

const ITENS_MENU: ItemMenu[] = [
  { rota: '/catalogo', icone: 'search', rotulo: 'Catálogo' },
  { rota: '/minhas-reservas', icone: 'bookmark', rotulo: 'Minhas reservas' },
  { rota: '/meus-emprestimos', icone: 'arrow-left-right', rotulo: 'Meus empréstimos' },
  { rota: '/perfil', icone: 'person', rotulo: 'Perfil' },
];

export function Layout() {
  const { data: sessao } = useSessao();
  const navegar = useNavigate();
  const qc = useQueryClient();

  async function sair() {
    await auth.logout().catch(() => undefined);

    qc.clear();

    navegar('/', { replace: true });
  }

  function menuDaConta(sessaoAtiva: Sessao) {
    const usuario = sessaoAtiva.data;

    return (
      <div className="dropdown">
        <button
          type="button"
          className={classes(
            'btn',
            'btn-link',
            'text-body',
            'text-decoration-none',
            'd-flex',
            'align-items-center',
            'gap-2',
            'p-0',
            'dropdown-toggle',
          )}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label="Menu da conta"
        >
          <Avatar nome={usuario.nome} url={usuario.foto_url} />
        </button>

        <ul className="dropdown-menu dropdown-menu-end">
          {ITENS_MENU.map((item) => (
            <li key={item.rota}>
              <Link className="dropdown-item" to={item.rota}>
                <i className={`bi bi-${item.icone} me-2`} aria-hidden="true" />
                {item.rotulo}
              </Link>
            </li>
          ))}

          <li>
            <hr className="dropdown-divider" />
          </li>

          <li>
            <button type="button" className="dropdown-item" onClick={sair}>
              <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
              Sair
            </button>
          </li>
        </ul>
      </div>
    );
  }

  function acessoVisitante() {
    return (
      <>
        <Link to="/entrar" className="btn btn-link text-decoration-none">
          Entrar
        </Link>

        <Link
          to="/criar-conta"
          className={classes(
            'btn',
            'btn-outline-primary',
            'd-none',
            'd-sm-inline-flex',
          )}
        >
          Criar conta
        </Link>
      </>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="navbar bg-body-tertiary border-bottom">
        <div className="container-xxl gap-3">
          <Link
            to="/catalogo"
            className={classes(
              'navbar-brand',
              'd-flex',
              'align-items-center',
              'gap-2',
              'fw-semibold',
            )}
          >
            <i className="bi bi-book-half text-primary" aria-hidden="true" />
            <span>LibControl</span>
          </Link>

          <BuscaCatalogo />

          <div className="d-flex align-items-center gap-2">
            {sessao
              ? menuDaConta(sessao)
              : acessoVisitante()}
          </div>
        </div>
      </header>

      <main className="flex-grow-1 container-xxl py-4">
        <Outlet />
      </main>

      <footer
        className={classes(
          'text-center',
          'small',
          'text-body-secondary',
          'py-4',
        )}
      >
        LibControl · software livre
      </footer>
    </div>
  );
}
