import { api } from './cliente';
import type {
  Area,
  Elegibilidade,
  Emprestimo,
  Endereco,
  Livro,
  Paginado,
  Reserva,
  Sessao,
  Usuario,
} from './tipos';

type Filtros = Record<string, string | number | boolean | undefined | null>;

type Parametros = Record<string, string | number>;

interface Envelope<T> {
  data: T;
}

interface LivroDetalhado {
  data: Livro;
  elegibilidade?: Elegibilidade | null;
}

type DadosAtualizacao = Partial<Usuario> & {
  password?: string;
  password_confirmation?: string;
  senha_atual?: string;
};

function limpar(filtros: Filtros): Parametros {
  const saida: Parametros = {};

  for (const [chave, valor] of Object.entries(filtros)) {
    const vazio = valor === undefined
      || valor === null
      || valor === ''
      || valor === false;

    if (vazio) continue;

    saida[chave] = (valor === true)
      ? 1
      : valor;
  }

  return saida;
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

export const auth = {
  sessao: () => obter<Sessao>('/auth/me'),

  login: (email: string, password: string) => {
    const corpo = { email, password, acesso: 'publico' };

    return enviar<Sessao>('/auth/login', corpo);
  },

  registrar: (form: FormData) => enviar<Sessao>('/auth/registrar', form),

  logout: () => enviar('/auth/logout'),
};

export const catalogo = {
  livros: (filtros: Filtros) => {
    const params = limpar(filtros);

    return obter<Paginado<Livro>>('/livros', params);
  },

  livro: (id: number) => obter<LivroDetalhado>(`/livros/${id}`),

  areas: async () => {
    const resposta = await obter<Envelope<Area[]>>('/areas');

    return resposta.data;
  },

  cep: async (cep: string) => {
    const resposta = await obter<Envelope<Endereco>>(`/cep/${cep}`);

    return resposta.data;
  },
};

export const leitor = {
  perfil: () => obter<Sessao>('/me'),

  atualizar: async (dados: DadosAtualizacao) => {
    const resposta = await substituir<Envelope<Usuario>>('/me', dados);

    return resposta.data;
  },

  foto: async (arquivo: File) => {
    const form = new FormData();

    form.append('foto', arquivo);

    const resposta = await enviar<Envelope<Usuario>>('/me/foto', form);

    return resposta.data;
  },

  reservas: (pagina = 1) => obter<Paginado<Reserva>>('/me/reservas', { page: pagina }),

  emprestimos: (pagina = 1) => obter<Paginado<Emprestimo>>('/me/emprestimos', { page: pagina }),

  reservar: async (livroId: number) => {
    const corpo = { livro_id: livroId };
    const resposta = await enviar<Envelope<Reserva>>('/reservas', corpo);

    return resposta.data;
  },

  cancelar: async (reservaId: number) => {
    const url = `/reservas/${reservaId}/cancelar`;
    const resposta = await enviar<Envelope<Reserva>>(url);

    return resposta.data;
  },
};
