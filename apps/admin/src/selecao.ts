const TELA_SEM_COLUNA_LATERAL = '(max-width: 1199.98px)';

const ESPERA_RENDERIZACAO = 50;

export function rolarParaDetalhes(): void {
  const consulta = window.matchMedia(TELA_SEM_COLUNA_LATERAL);

  if (!consulta.matches) return;

  window.setTimeout(() => {
    const coluna = document.querySelector('[data-coluna="detalhes"]');

    coluna?.scrollIntoView({ behavior: 'smooth' });
  }, ESPERA_RENDERIZACAO);
}
