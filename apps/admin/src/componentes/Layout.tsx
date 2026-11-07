import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../api/servicos';
import type { Sessao } from '../api/tipos';
import { useSessao } from '../sessao';
import { classes } from '../utilitarios/classes';
import { Avatar } from './Avatar';

interface ItemMenu {
  rota: string;
  icone: string;
  rotulo: string;
  exato?: boolean;
}

const ITENS_MENU: ItemMenu[] = [
  { rota: '/', icone: 'speedometer2', rotulo: 'Painel', exato: true },
  { rota: '/livros', icone: 'book', rotulo: 'Livros' },
  { rota: '/reservas', icone: 'bookmark', rotulo: 'Reservas' },
  { rota: '/emprestimos', icone: 'arrow-left-right', rotulo: 'Empréstimos' },
  { rota: '/leitores', icone: 'person', rotulo: 'Leitores' },
];

const ID_MENU_LATERAL = 'menu-lateral';

function classesDoItem({ isActive }: { isActive: boolean }): string {
  return classes(
    'nav-link',
    'd-flex',
    'align-items-center',
    'gap-2',
    'rounded',
    isActive && 'active',
  );
}

export function Layout() {
  const { data: sessao } = useSessao();
  const navegar = useNavigate();
  const qc = useQueryClient();

  async function sair() {
    await auth.logout().catch(() => undefined);

    qc.clear();

    navegar('/entrar', { replace: true });
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

          <span className="small d-none d-sm-inline">{usuario.nome}</span>
        </button>

        <ul className="dropdown-menu dropdown-menu-end">
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

  return (
    <div className="d-flex min-vh-100">
      <aside
        id={ID_MENU_LATERAL}
        className={classes(
          'offcanvas-lg',
          'offcanvas-start',
          'bg-body-tertiary',
          'border-end',
          'flex-shrink-0',
        )}
        style={{ width: 240 }}
        tabIndex={-1}
        aria-label="Menu"
      >
        <div className="offcanvas-header">
          <span className="fw-semibold">Menu</span>

          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            data-bs-target={`#${ID_MENU_LATERAL}`}
            aria-label="Fechar menu"
          />
        </div>

        <div
          className={classes(
            'offcanvas-body',
            'd-flex',
            'flex-column',
            'gap-3',
            'p-3',
            'h-100',
          )}
        >
          <div
            className={classes(
              'd-flex',
              'align-items-center',
              'gap-2',
              'fw-semibold',
              'px-2',
            )}
          >
            <i className="bi bi-book-half text-primary" aria-hidden="true" />
            <span>LibControl</span>
          </div>

          <nav
            className="nav nav-pills flex-column gap-1"
            aria-label="Navegação principal"
            data-bs-dismiss="offcanvas"
            data-bs-target={`#${ID_MENU_LATERAL}`}
          >
            {ITENS_MENU.map((item) => (
              <NavLink
                key={item.rota}
                to={item.rota}
                end={item.exato}
                className={classesDoItem}
              >
                <i className={`bi bi-${item.icone}`} aria-hidden="true" />
                {item.rotulo}
              </NavLink>
            ))}
          </nav>

          <div
            className={classes(
              'mt-auto',
              'pt-2',
              'border-top',
              'small',
              'text-body-secondary',
              'px-2',
            )}
          >
            Administração
          </div>
        </div>
      </aside>

      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ minWidth: 0 }}
      >
        <header
          className={classes(
            'navbar',
            'bg-body-tertiary',
            'border-bottom',
            'px-3',
          )}
        >
          <button
            type="button"
            className="btn btn-link text-body d-lg-none p-0"
            data-bs-toggle="offcanvas"
            data-bs-target={`#${ID_MENU_LATERAL}`}
            aria-controls={ID_MENU_LATERAL}
            aria-label="Abrir menu"
          >
            <i className="bi bi-list fs-4" aria-hidden="true" />
          </button>

          <div className="d-flex align-items-center gap-2 ms-auto">
            {sessao && menuDaConta(sessao)}
          </div>
        </header>

        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
