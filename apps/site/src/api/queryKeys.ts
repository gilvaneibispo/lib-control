export const queryKeys = {
  sessao: ['sessao'] as const,
  areas: ['areas'] as const,
  livros: {
    todos: ['livros'] as const,
    lista: (filtros: Record<string, unknown>) => ['livros', 'lista', filtros] as const,
    detalhe: (id: number) => ['livros', 'detalhe', id] as const,
  },
  me: {
    reservas: ['me', 'reservas'] as const,
    emprestimos: ['me', 'emprestimos'] as const,
  },
};
