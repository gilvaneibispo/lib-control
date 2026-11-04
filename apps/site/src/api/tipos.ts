export type Papel = 'leitor' | 'admin';

export type StatusExemplar = 'disponivel' | 'reservado' | 'emprestado' | 'indisponivel';

export type StatusReserva = 'ativa' | 'convertida' | 'expirada' | 'cancelada';

export type StatusEmprestimo = 'ativo' | 'atrasado' | 'devolvido';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  data_nascimento: string | null;
  foto_url: string | null;
  cep: string | null;
  uf: string | null;
  cidade: string | null;
  bairro: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  papel: Papel;
  bloqueado?: boolean;
  bloqueado_em?: string | null;
  motivo_bloqueio?: string | null;
  criado_em: string | null;
}

export interface Elegibilidade {
  elegivel: boolean;
  codigo: string | null;
  mensagem: string | null;
  itens_em_uso: number;
  limite: number;
}

export interface Sessao {
  data: Usuario;
  elegibilidade?: Elegibilidade | null;
}

export interface Subarea {
  id: number;
  area_id: number;
  nome: string;
  livros_count?: number;
}

export interface Area {
  id: number;
  codigo: number;
  nome: string;
  livros_count?: number;
  subareas?: Subarea[];
}

export interface AreaResumo {
  id: number;
  codigo: number;
  nome: string;
}

export interface SubareaResumo {
  id: number;
  nome: string;
}

export interface Livro {
  id: number;
  titulo: string;
  subtitulo: string | null;
  isbn: string | null;
  ano: number | null;
  editora: string | null;
  sinopse: string | null;
  cdd: string | null;
  cdu: string | null;
  area?: AreaResumo | null;
  subarea?: SubareaResumo | null;
  capa_url: string | null;
  autores?: string[];
  exemplares_total?: number;
  exemplares_disponiveis?: number;
  disponivel?: boolean;
  criado_em: string | null;
}

export interface LivroResumo {
  id: number;
  titulo: string;
  isbn: string | null;
  capa_url: string | null;
  autores: string[];
}

export interface Exemplar {
  id: number;
  livro_id: number;
  codigo: string;
  status: StatusExemplar;
  observacao: string | null;
  livro?: LivroResumo;
}

export interface ExemplarResumo {
  id: number;
  codigo: string;
}

export interface Reserva {
  id: number;
  status: StatusReserva;
  expira_em: string;
  finalizada_em: string | null;
  criada_em: string | null;
  livro?: Livro;
  exemplar?: ExemplarResumo;
}

export interface Emprestimo {
  id: number;
  origem: 'reserva' | 'balcao';
  status: StatusEmprestimo;
  dias_restantes: number | null;
  dias_atraso: number;
  emprestado_em: string;
  devolver_ate: string;
  devolvido_em: string | null;
  exemplar?: Exemplar;
}

export interface MetaPaginacao {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface LinksPaginacao {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface Paginado<T> {
  data: T[];
  meta: MetaPaginacao;
  links: LinksPaginacao;
}

export interface Endereco {
  cep: string;
  uf: string | null;
  cidade: string | null;
  bairro: string | null;
  rua: string | null;
}
