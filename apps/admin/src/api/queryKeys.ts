export const queryKeys = {
  sessao: ['sessao'] as const,
  areas: ['areas'] as const,
  painel: ['painel'] as const,
  autores: (termo: string) => ['autores', termo] as const,
  livros: {
    todos: ['livros'] as const,
    lista: (filtros: Record<string, unknown>) => ['livros', 'lista', filtros] as const,
    detalhe: (id: number) => ['livros', 'detalhe', id] as const,
    exemplares: (id: number) => ['livros', 'exemplares', id] as const,
  },
  exemplares: {
    disponiveis: (termo: string) => ['exemplares', 'disponiveis', termo] as const,
  },
  reservas: {
    todas: ['reservas'] as const,
    lista: (filtros: Record<string, unknown>) => ['reservas', 'lista', filtros] as const,
  },
  emprestimos: {
    todos: ['emprestimos'] as const,
    lista: (filtros: Record<string, unknown>) => ['emprestimos', 'lista', filtros] as const,
  },
  leitores: {
    todos: ['leitores'] as const,
    lista: (filtros: Record<string, unknown>) => ['leitores', 'lista', filtros] as const,
    detalhe: (id: number) => ['leitores', 'detalhe', id] as const,
  },
};
