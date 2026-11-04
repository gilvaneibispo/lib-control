type Tom = 'success' | 'primary' | 'danger' | 'secondary';

interface Configuracao {
  rotulo: string;
  tom: Tom;
}

const STATUS: Record<string, Configuracao> = {
  disponivel: { rotulo: 'Disponível', tom: 'success' },
  indisponivel: { rotulo: 'Indisponível', tom: 'secondary' },
  devolvido: { rotulo: 'Devolvido', tom: 'success' },
  ativa: { rotulo: 'Ativa', tom: 'primary' },
  ativo: { rotulo: 'Ativo', tom: 'primary' },
  convertida: { rotulo: 'Retirada', tom: 'success' },
  atrasado: { rotulo: 'Atrasado', tom: 'danger' },
  expirada: { rotulo: 'Expirada', tom: 'secondary' },
  cancelada: { rotulo: 'Cancelada', tom: 'secondary' },
};

export function SeloStatus({ status }: { status: string }) {
  const padrao: Configuracao = { rotulo: status, tom: 'secondary' };
  const configuracao = STATUS[status] ?? padrao;

  return (
    <span className={`badge rounded-pill text-bg-${configuracao.tom}`}>
      {configuracao.rotulo}
    </span>
  );
}
