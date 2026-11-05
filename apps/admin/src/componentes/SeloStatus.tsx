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
