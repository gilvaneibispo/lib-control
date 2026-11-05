export const queryKeys = {
  sessao: ['sessao'] as const,
  areas: ['areas'] as const,
  livros: {
    todos: ['livros'] as const,
    lista: (filtros: Record<string, unknown>) => ['livros', 'lista', filtros] as const,
    detalhe: (id: number) => ['livros', 'detalhe', id] as const,
    exemplares: (id: number) => ['livros', 'exemplares', id] as const,
  },
};
