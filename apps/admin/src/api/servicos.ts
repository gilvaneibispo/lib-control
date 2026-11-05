import { api } from './cliente';
import type {
  Area,
  Exemplar,
  ExemplarPayload,
  Livro,
  LivroPayload,
  Paginado,
  Sessao,
} from './tipos';

type Parametros = Record<string, string | number>;

interface Envelope<T> {
  data: T;
}

async function obter<T>(url: string, params?: Parametros): Promise<T> {
  const resposta = await api.get<T>(url, { params });

  return resposta.data;
}

async function enviar<T>(url: string, corpo?: unknown): Promise<T> {
  const resposta = await api.post<T>(url, corpo);

  return resposta.data;
}

async function substituir<T>(url: string, corpo: unknown): Promise<T> {
  const resposta = await api.put<T>(url, corpo);

  return resposta.data;
}

async function alterar<T>(url: string, corpo: unknown): Promise<T> {
  const resposta = await api.patch<T>(url, corpo);

  return resposta.data;
}

async function excluir(url: string): Promise<void> {
  await api.delete(url);
}

export const auth = {
  sessao: () => obter<Sessao>('/auth/me'),

  login: (email: string, password: string) => {
    const corpo = { email, password, acesso: 'admin' };

    return enviar<Sessao>('/auth/login', corpo);
  },

  logout: () => enviar('/auth/logout'),
};

export const catalogo = {
  areas: async () => {
    const resposta = await obter<Envelope<Area[]>>('/areas');

    return resposta.data;
  },
};

export const admin = {
  livros: (pagina = 1) => obter<Paginado<Livro>>('/admin/livros', { page: pagina }),

  livro: async (id: number) => {
    const resposta = await obter<Envelope<Livro>>(`/admin/livros/${id}`);

    return resposta.data;
  },

  criarLivro: async (dados: LivroPayload) => {
    const resposta = await enviar<Envelope<Livro>>('/admin/livros', dados);

    return resposta.data;
  },

  atualizarLivro: async (id: number, dados: LivroPayload) => {
    const resposta = await substituir<Envelope<Livro>>(`/admin/livros/${id}`, dados);

    return resposta.data;
  },

  excluirLivro: (id: number) => excluir(`/admin/livros/${id}`),

  exemplares: async (livroId: number) => {
    const url = `/admin/livros/${livroId}/exemplares`;
    const resposta = await obter<Envelope<Exemplar[]>>(url);

    return resposta.data;
  },

  adicionarExemplares: async (livroId: number, quantidade: number) => {
    const url = `/admin/livros/${livroId}/exemplares`;
    const corpo = { quantidade };
    const resposta = await enviar<Envelope<Exemplar[]>>(url, corpo);

    return resposta.data;
  },

  atualizarExemplar: async (id: number, dados: ExemplarPayload) => {
    const url = `/admin/exemplares/${id}`;
    const resposta = await alterar<Envelope<Exemplar>>(url, dados);

    return resposta.data;
  },

  excluirExemplar: (id: number) => excluir(`/admin/exemplares/${id}`),
};
