export type Papel = 'leitor' | 'admin';

export type StatusExemplar = 'disponivel' | 'reservado' | 'emprestado' | 'indisponivel';

export type StatusReserva = 'ativa' | 'convertida' | 'expirada' | 'cancelada';

export type StatusEmprestimo = 'ativo' | 'atrasado' | 'devolvido';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  foto_url: string | null;
  papel: Papel;
}

export interface Sessao {
  data: Usuario;
}

export interface Subarea {
  id: number;
  area_id: number;
  nome: string;
}

export interface Area {
  id: number;
  codigo: number;
  nome: string;
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
  criado_em: string | null;
}

export interface LivroPayload {
  titulo: string;
  subtitulo: string | null;
  isbn: string | null;
  ano: number | null;
  editora: string | null;
  sinopse: string | null;
  cdd: string | null;
  cdu: string | null;
  area_id: number | null;
  subarea_id: number | null;
  autores: string[];
  quantidade_exemplares?: number;
}

export interface LivroDoExemplar {
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
  livro?: LivroDoExemplar;
}

export interface ExemplarResumo {
  id: number;
  codigo: string;
}

export interface LeitorResumo {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  foto_url: string | null;
  bloqueado: boolean;
}

export interface Reserva {
  id: number;
  status: StatusReserva;
  expira_em: string;
  finalizada_em: string | null;
  criada_em: string | null;
  livro?: Livro;
  exemplar?: ExemplarResumo;
  leitor?: LeitorResumo;
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
  leitor?: LeitorResumo;
  emprestado_por?: string | null;
  recebido_por?: string | null;
}

export interface ResultadoDevolucao {
  data: Emprestimo;
  dias_atraso: number;
  leitor_desbloqueado: boolean;
}

export interface ExemplarPayload {
  codigo: string;
  status: 'disponivel' | 'indisponivel';
  observacao: string | null;
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
