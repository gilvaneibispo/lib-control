type Tom = 'success' | 'primary' | 'danger' | 'secondary';

interface Configuracao {
  rotulo: string;
  tom: Tom;
}

const STATUS: Record<string, Configuracao> = {
  disponivel: { rotulo: 'Disponível', tom: 'success' },
  indisponivel: { rotulo: 'Indisponível', tom: 'secondary' },
  reservado: { rotulo: 'Reservado', tom: 'primary' },
  emprestado: { rotulo: 'Emprestado', tom: 'primary' },
  ativa: { rotulo: 'Ativa', tom: 'primary' },
  convertida: { rotulo: 'Retirada', tom: 'success' },
  expirada: { rotulo: 'Expirada', tom: 'secondary' },
  cancelada: { rotulo: 'Cancelada', tom: 'secondary' },
  ativo: { rotulo: 'Ativo', tom: 'primary' },
  atrasado: { rotulo: 'Atrasado', tom: 'danger' },
  devolvido: { rotulo: 'Devolvido', tom: 'success' },
  bloqueado: { rotulo: 'Bloqueado', tom: 'danger' },
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
