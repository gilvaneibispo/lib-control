export type Papel = 'leitor' | 'admin';

export type StatusExemplar = 'disponivel' | 'reservado' | 'emprestado' | 'indisponivel';

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

export interface Exemplar {
  id: number;
  livro_id: number;
  codigo: string;
  status: StatusExemplar;
  observacao: string | null;
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
