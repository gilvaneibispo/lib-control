import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Controller,
  useForm,
  useWatch,
  type ControllerRenderProps,
} from 'react-hook-form';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { errosDeValidacao, mensagemDeErro } from '../api/erros';
import { queryKeys } from '../api/queryKeys';
import { admin, catalogo } from '../api/servicos';
import type {
  CapaCandidata,
  Livro,
  LivroPayload,
  ResultadoIsbn,
} from '../api/tipos';
import { Alerta } from '../componentes/Alerta';
import { AutoresInput } from '../componentes/AutoresInput';
import { Campo } from '../componentes/Campo';
import { Capa } from '../componentes/Capa';
import { Carregando } from '../componentes/Carregando';
import { ErroCarregamento } from '../componentes/ErroCarregamento';
import { Modal } from '../componentes/Modal';
import { SeletorArquivo } from '../componentes/SeletorArquivo';
import { useToast } from '../componentes/toastContexto';
import { classes } from '../utilitarios/classes';
import { formatarIsbn } from '../utilitarios/formatadores';
import { mascararIsbn } from '../utilitarios/mascaras';
import { isbnValido, normalizarIsbn } from '../utilitarios/validadores';

const ANO_MINIMO = 1450;

const ANO_MAXIMO = new Date().getFullYear() + 1;

const TAMANHO_MAXIMO_CAPA = 5 * 1024 * 1024;

const LARGURA_CAPA = { width: 110 };

const LARGURA_CANDIDATA = { width: 56 };

const NOMES_FONTES: Record<string, string> = {
  brasilapi: 'BrasilAPI',
  openlibrary: 'Open Library',
  google: 'Google Books',
};

const CAMPOS_METADADOS = [
  'titulo',
  'subtitulo',
  'editora',
  'ano',
  'sinopse',
  'autores',
] as const;

function isbnOpcionalValido(valor: string): boolean {
  if (!valor.trim()) return true;

  return isbnValido(valor);
}

function anoOpcionalValido(valor: string): boolean {
  if (!valor) return true;

  if (!/^\d{4}$/.test(valor)) return false;

  const ano = Number(valor);

  return ano >= ANO_MINIMO && ano <= ANO_MAXIMO;
}

const esquema = z.object({
  titulo: z.string().trim().min(1, 'Informe o título.').max(255),
  subtitulo: z.string().max(255),

  isbn: z
    .string()
    .refine(isbnOpcionalValido, 'ISBN inválido: confira o dígito verificador.'),

  ano: z
    .string()
    .refine(anoOpcionalValido, `Ano entre ${ANO_MINIMO} e ${ANO_MAXIMO}.`),

  editora: z.string().max(150),
  sinopse: z.string().max(10000),
  cdd: z.string().max(40),
  cdu: z.string().max(80),
  area_id: z.string(),
  subarea_id: z.string(),
  autores: z.array(z.string()),
  quantidade_exemplares: z
    .number('Informe a quantidade.')
    .int()
    .min(1, 'Mínimo 1.')
    .max(50, 'Máximo 50.'),
});

type Dados = z.infer<typeof esquema>;

type CampoArea = ControllerRenderProps<Dados, 'area_id'>;

type CampoIsbn = ControllerRenderProps<Dados, 'isbn'>;

type CampoAutores = ControllerRenderProps<Dados, 'autores'>;

type CampoMetadado = (typeof CAMPOS_METADADOS)[number];

type ValorMetadado = string | string[];

type Divergencias = Partial<Record<CampoMetadado, ValorMetadado>>;

type EscolhaCapa =
  | { tipo: 'candidata'; capa: CapaCandidata }
  | { tipo: 'arquivo'; arquivo: File }
  | null;

const VAZIO: Dados = {
  titulo: '',
  subtitulo: '',
  isbn: '',
  ano: '',
  editora: '',
  sinopse: '',
  cdd: '',
  cdu: '',
  area_id: '',
  subarea_id: '',
  autores: [],
  quantidade_exemplares: 1,
};

function nomeFonte(fonte: string): string {
  return NOMES_FONTES[fonte] ?? fonte;
}

function estaVazio(valor: ValorMetadado): boolean {
  if (Array.isArray(valor)) return valor.length === 0;

  return !valor.trim();
}

function metadadosDoIsbn(resultado: ResultadoIsbn): Record<CampoMetadado, ValorMetadado> {
  const ano = resultado.ano
    ? String(resultado.ano)
    : '';

  return {
    titulo: resultado.titulo ?? '',
    subtitulo: resultado.subtitulo ?? '',
    editora: resultado.editora ?? '',
    ano,
    sinopse: resultado.sinopse ?? '',
    autores: resultado.autores,
  };
}

function textoOuNulo(valor: string): string | null {
  const limpo = valor.trim();

  return limpo || null;
}

function numeroOuNulo(valor: string): number | null {
  if (!valor) return null;

  return Number(valor);
}

function paraFormulario(livro: Livro): Dados {
  const ano = livro.ano
    ? String(livro.ano)
    : '';

  const areaId = livro.area
    ? String(livro.area.id)
    : '';

  const subareaId = livro.subarea
    ? String(livro.subarea.id)
    : '';

  return {
    titulo: livro.titulo,
    subtitulo: livro.subtitulo ?? '',
    isbn: formatarIsbn(livro.isbn),
    ano,
    editora: livro.editora ?? '',
    sinopse: livro.sinopse ?? '',
    cdd: livro.cdd ?? '',
    cdu: livro.cdu ?? '',
    area_id: areaId,
    subarea_id: subareaId,
    autores: livro.autores ?? [],
    quantidade_exemplares: 1,
  };
}

function paraPayload(dados: Dados, editando: boolean): LivroPayload {
  const isbn = dados.isbn.trim()
    ? normalizarIsbn(dados.isbn)
    : null;

  const payload: LivroPayload = {
    titulo: dados.titulo.trim(),
    subtitulo: textoOuNulo(dados.subtitulo),
    isbn,
    ano: numeroOuNulo(dados.ano),
    editora: textoOuNulo(dados.editora),
    sinopse: textoOuNulo(dados.sinopse),
    cdd: textoOuNulo(dados.cdd),
    cdu: textoOuNulo(dados.cdu),
    area_id: numeroOuNulo(dados.area_id),
    subarea_id: numeroOuNulo(dados.subarea_id),
    autores: dados.autores,
  };

  if (!editando) payload.quantidade_exemplares = dados.quantidade_exemplares;

  return payload;
}

export function LivroForm() {
  const parametros = useParams();
  const navegar = useNavigate();
  const local = useLocation();
  const toast = useToast();
  const qc = useQueryClient();

  const livroId = parametros.id
    ? Number(parametros.id)
    : null;

  const editando = livroId !== null;

  const [escolhaCapa, setEscolhaCapa] = useState<EscolhaCapa>(null);
  const [erroCapa, setErroCapa] = useState<string | null>(null);
  const [isbnBusca, setIsbnBusca] = useState<ResultadoIsbn | null>(null);
  const [isbnAviso, setIsbnAviso] = useState<string | null>(null);
  const [divergencias, setDivergencias] = useState<Divergencias>({});

  const ultimoIsbnBuscado = useRef<string | null>(null);
  const editados = useRef<Set<string>>(new Set());

  function fechar() {
    navegar({ pathname: '/livros', search: local.search });
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    setError,
    formState,
  } = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: VAZIO,
  });

  const livro = useQuery({
    queryKey: queryKeys.livros.detalhe(livroId ?? 0),
    queryFn: () => admin.livro(livroId ?? 0),
    enabled: editando,
  });

  const { data: areas = [] } = useQuery({
    queryKey: queryKeys.areas,
    queryFn: catalogo.areas,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!livro.data) return;

    const valores = paraFormulario(livro.data);

    reset(valores);

    ultimoIsbnBuscado.current = livro.data.isbn;

    for (const campo of CAMPOS_METADADOS) {
      editados.current.add(campo);
    }
  }, [livro.data, reset]);

  const areaId = useWatch({ control, name: 'area_id' });

  const tituloDigitado = useWatch({ control, name: 'titulo' });

  const isbnDigitado = useWatch({ control, name: 'isbn' });

  const subareas = useMemo(() => {
    const area = areas.find((a) => String(a.id) === areaId);

    return area?.subareas ?? [];
  }, [areas, areaId]);

  const salvar = useMutation({
    mutationFn: async (dados: Dados) => {
      const payload = paraPayload(dados, editando);

      const salvo = livroId !== null
        ? await admin.atualizarLivro(livroId, payload)
        : await admin.criarLivro(payload);

      let avisoCapa: string | null = null;

      try {
        if (escolhaCapa?.tipo === 'candidata') {
          const { url, origem } = escolhaCapa.capa;

          await admin.capaPorUrl(salvo.id, url, origem);
        }

        if (escolhaCapa?.tipo === 'arquivo') {
          await admin.capaPorArquivo(salvo.id, escolhaCapa.arquivo);
        }
      } catch (erro) {
        avisoCapa = mensagemDeErro(erro);
      }

      return { salvo, avisoCapa };
    },

    onSuccess: ({ salvo, avisoCapa }) => {
      qc.invalidateQueries({ queryKey: queryKeys.livros.todos });
      qc.invalidateQueries({ queryKey: queryKeys.areas });

      const mensagem = editando
        ? 'Livro atualizado.'
        : `“${salvo.titulo}” cadastrado.`;

      toast.sucesso(mensagem);

      if (avisoCapa) toast.erro(`O livro foi salvo, mas a capa não: ${avisoCapa}`);

      setEscolhaCapa(null);

      if (editando) {
        fechar();

        return;
      }

      navegar('/livros');
    },

    onError: (erro) => {
      const campos = errosDeValidacao(erro);

      for (const [campo, mensagem] of Object.entries(campos)) {
        setError(campo as keyof Dados, { message: mensagem });
      }

      toast.erro(mensagemDeErro(erro));
    },
  });

  const removerCapa = useMutation({
    mutationFn: () => admin.removerCapa(livroId ?? 0),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.livros.todos });

      toast.sucesso('Capa removida.');
    },

    onError: (erro) => toast.erro(mensagemDeErro(erro)),
  });

  const buscaIsbn = useMutation({
    mutationFn: (isbn: string) => admin.isbn(isbn),

    onSuccess: (resultado) => {
      setIsbnBusca(resultado);

      setIsbnAviso(null);

      aplicarMetadados(resultado);

      const primeiraCapa = resultado.capas[0];
      const semCapaEscolhida = !escolhaCapa && !livro.data?.capa_url;

      if (primeiraCapa && semCapaEscolhida) {
        setEscolhaCapa({ tipo: 'candidata', capa: primeiraCapa });
      }
    },

    onError: (erro) => {
      setIsbnBusca(null);

      setIsbnAviso(mensagemDeErro(erro));
    },
  });

  const erros = formState.errors;

  const capaAtual = livro.data?.capa_url;

  const capasEncontradas = isbnBusca?.capas ?? [];

  const livroExistente = isbnBusca?.livro_existente ?? null;

  const outroLivroComIsbn = livroExistente !== null
    && livroExistente.id !== livroId;

  const carregando = editando && livro.isLoading;

  function aoMudarArea(e: ChangeEvent<HTMLSelectElement>, campo: CampoArea) {
    campo.onChange(e.target.value);

    setValue('subarea_id', '');
  }

  function marcarEditado(campo: string) {
    editados.current.add(campo);
  }

  function registrarMetadado(campo: CampoMetadado) {
    const registro = register(campo);

    function aoMudar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      marcarEditado(campo);

      return registro.onChange(e);
    }

    return { ...registro, onChange: aoMudar };
  }

  function buscarIsbn(forcar = false) {
    const isbn = normalizarIsbn(getValues('isbn'));

    if (!isbn) return;

    if (!forcar && isbn === ultimoIsbnBuscado.current) return;

    ultimoIsbnBuscado.current = isbn;

    buscaIsbn.mutate(isbn);
  }

  function aplicarMetadados(resultado: ResultadoIsbn) {
    const novos = metadadosDoIsbn(resultado);
    const divergentes: Divergencias = {};

    for (const campo of CAMPOS_METADADOS) {
      const novo = novos[campo];

      if (estaVazio(novo)) continue;

      const atual = getValues(campo);
      const podeSubstituir = estaVazio(atual) || !editados.current.has(campo);

      if (podeSubstituir) {
        setValue(campo, novo as never, { shouldValidate: true });

        continue;
      }

      const atualSerializado = JSON.stringify(atual);
      const novoSerializado = JSON.stringify(novo);

      if (atualSerializado !== novoSerializado) divergentes[campo] = novo;
    }

    setDivergencias(divergentes);
  }

  function aplicarDivergencia(campo: CampoMetadado) {
    const valor = divergencias[campo];

    if (valor === undefined) return;

    setValue(campo, valor as never, { shouldValidate: true });

    setDivergencias((atuais) => {
      const restantes = { ...atuais };

      delete restantes[campo];

      return restantes;
    });
  }

  function aoDigitarIsbn(e: ChangeEvent<HTMLInputElement>, campo: CampoIsbn) {
    marcarEditado('isbn');

    const mascarado = mascararIsbn(e.target.value);

    campo.onChange(mascarado);
  }

  function aoSairIsbn(campo: CampoIsbn) {
    campo.onBlur();

    buscarIsbn();
  }

  function aoMudarAutores(autores: string[], campo: CampoAutores) {
    marcarEditado('autores');

    campo.onChange(autores);
  }

  function aoEscolherCapa(arquivo: File | null) {
    setErroCapa(null);

    const escolha: EscolhaCapa = arquivo
      ? { tipo: 'arquivo', arquivo }
      : null;

    setEscolhaCapa(escolha);
  }

  function aoDescartarCapa() {
    if (escolhaCapa) {
      setEscolhaCapa(null);

      return;
    }

    removerCapa.mutate();
  }

  function situacaoCapa() {
    if (escolhaCapa?.tipo === 'candidata') {
      const fonte = nomeFonte(escolhaCapa.capa.origem);

      return `Capa de ${fonte}: será baixada ao salvar.`;
    }

    if (escolhaCapa?.tipo === 'arquivo') {
      return `Arquivo ${escolhaCapa.arquivo.name}: será enviado ao salvar.`;
    }

    if (capaAtual) return 'Capa atual.';

    return 'Sem capa.';
  }

  function urlPreviaCapa() {
    if (escolhaCapa?.tipo === 'candidata') return escolhaCapa.capa.url;

    if (escolhaCapa?.tipo === 'arquivo') return undefined;

    return capaAtual;
  }

  function rotuloComAplicar(rotulo: string, campo: CampoMetadado) {
    const valor = divergencias[campo];

    if (valor === undefined) return rotulo;

    const texto = String(valor);
    const resumo = texto.slice(0, 40);

    return (
      <>
        {rotulo}

        <button
          type="button"
          className={classes(
            'btn',
            'btn-link',
            'btn-sm',
            'p-0',
            'ms-2',
            'align-baseline',
          )}
          title={`Valor encontrado: ${texto}`}
          onClick={() => aplicarDivergencia(campo)}
        >
          aplicar “{resumo}”
        </button>
      </>
    );
  }

  function candidataCapa(capa: CapaCandidata) {
    const ativa = escolhaCapa?.tipo === 'candidata'
      && escolhaCapa.capa.url === capa.url;

    const fonte = nomeFonte(capa.origem);

    return (
      <button
        key={capa.url}
        type="button"
        className={classes(
          'p-0',
          'border',
          'rounded',
          'bg-transparent',
          ativa && 'border-2',
          ativa && 'border-primary',
        )}
        style={LARGURA_CANDIDATA}
        aria-pressed={ativa}
        aria-label={`Usar capa de ${fonte}`}
        onClick={() => setEscolhaCapa({ tipo: 'candidata', capa })}
      >
        <Capa url={capa.url} titulo={fonte} />
      </button>
    );
  }

  function enviar(dados: Dados) {
    salvar.mutate(dados);
  }

  const titulo = editando
    ? 'Editar livro'
    : 'Novo livro';

  const descricao = editando
    ? undefined
    : 'Preencha os dados do livro; tudo continua editável depois.';

  function formulario() {
    return (
      <form
        onSubmit={handleSubmit(enviar)}
        noValidate
      >
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card">
              <div className="card-body d-flex flex-column gap-3">
                <Campo
                  rotulo="ISBN"
                  htmlFor="isbn"
                  erro={erros.isbn?.message}
                  dica="ISBN-10 ou 13; opcional. Ao sair do campo, buscamos os dados."
                >
                  <div className="d-flex gap-2">
                    <Controller
                      control={control}
                      name="isbn"
                      render={({ field }) => (
                        <input
                          id="isbn"
                          className={classes(
                            'form-control',
                            'font-monospace',
                            erros.isbn && 'is-invalid',
                          )}
                          inputMode="numeric"
                          placeholder="978-85-359-1484-9"
                          value={field.value}
                          onChange={(e) => aoDigitarIsbn(e, field)}
                          onBlur={() => aoSairIsbn(field)}
                        />
                      )}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={!isbnValido(isbnDigitado) || buscaIsbn.isPending}
                      onClick={() => buscarIsbn(true)}
                    >
                      {buscaIsbn.isPending ? (
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          aria-hidden="true"
                        />
                      ) : (
                        <i className="bi bi-search me-1" aria-hidden="true" />
                      )}
                      Buscar
                    </button>
                  </div>
                </Campo>

                {outroLivroComIsbn && (
                  <Alerta
                    tom="danger"
                    titulo="ISBN já cadastrado"
                    icone="exclamation-triangle"
                  >
                    Este ISBN pertence a{' '}

                    <Link
                      to={{
                        pathname: `/livros/${livroExistente.id}`,
                        search: local.search,
                      }}
                    >
                      {livroExistente.titulo}
                    </Link>.
                  </Alerta>
                )}

                {isbnAviso && (
                  <Alerta titulo="Busca por ISBN">{isbnAviso}</Alerta>
                )}

                {isbnBusca && !livroExistente && (
                  <p className="small text-body-secondary mb-0">
                    <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                    Dados encontrados em {nomeFonte(isbnBusca.fonte)}. Revise antes de salvar.
                  </p>
                )}

                <Campo
                  rotulo={rotuloComAplicar('Título', 'titulo')}
                  htmlFor="titulo"
                  erro={erros.titulo?.message}
                >
                  <input
                    id="titulo"
                    className={classes('form-control', erros.titulo && 'is-invalid')}
                    {...registrarMetadado('titulo')}
                  />
                </Campo>

                <Campo
                  rotulo={rotuloComAplicar('Subtítulo', 'subtitulo')}
                  htmlFor="subtitulo"
                  erro={erros.subtitulo?.message}
                >
                  <input
                    id="subtitulo"
                    className="form-control"
                    {...registrarMetadado('subtitulo')}
                  />
                </Campo>

                <Campo
                  rotulo={rotuloComAplicar('Autores', 'autores')}
                  htmlFor="autores"
                  erro={erros.autores?.message}
                  dica="Enter ou vírgula para adicionar."
                >
                  <Controller
                    control={control}
                    name="autores"
                    render={({ field }) => (
                      <AutoresInput
                        id="autores"
                        value={field.value}
                        onChange={(autores) => aoMudarAutores(autores, field)}
                      />
                    )}
                  />
                </Campo>

                <div className="row g-3">
                  <div className="col-sm-4">
                    <Campo
                      rotulo={rotuloComAplicar('Ano', 'ano')}
                      htmlFor="ano"
                      erro={erros.ano?.message}
                    >
                      <input
                        id="ano"
                        inputMode="numeric"
                        maxLength={4}
                        className={classes('form-control', erros.ano && 'is-invalid')}
                        {...registrarMetadado('ano')}
                      />
                    </Campo>
                  </div>

                  <div className="col-sm-8">
                    <Campo
                      rotulo={rotuloComAplicar('Editora', 'editora')}
                      htmlFor="editora"
                      erro={erros.editora?.message}
                    >
                      <input
                        id="editora"
                        className="form-control"
                        {...registrarMetadado('editora')}
                      />
                    </Campo>
                  </div>
                </div>

                <Campo
                  rotulo={rotuloComAplicar('Sinopse', 'sinopse')}
                  htmlFor="sinopse"
                  erro={erros.sinopse?.message}
                >
                  <textarea
                    id="sinopse"
                    rows={5}
                    className="form-control"
                    {...registrarMetadado('sinopse')}
                  />
                </Campo>

                {!editando && (
                  <Campo
                    rotulo="Exemplares iniciais"
                    htmlFor="quantidade"
                    erro={erros.quantidade_exemplares?.message}
                    dica="Os tombos são gerados como {livro}-{nº} e podem ser editados depois."
                  >
                    <input
                      id="quantidade"
                      type="number"
                      min={1}
                      max={50}
                      className={classes(
                        'form-control',
                        erros.quantidade_exemplares && 'is-invalid',
                      )}
                      style={{ maxWidth: 120 }}
                      {...register('quantidade_exemplares', { valueAsNumber: true })}
                    />
                  </Campo>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card">
              <div className="card-header">
                <h2 className="h6 mb-1">Classificação</h2>

                <p className="small text-body-secondary mb-0">
                  Códigos CDD e CDU, área e sub-área do livro.
                </p>
              </div>

              <div className="card-body d-flex flex-column gap-3">
                <div className="row g-3">
                  <div className="col-6">
                    <Campo rotulo="CDD" htmlFor="cdd" erro={erros.cdd?.message}>
                      <input
                        id="cdd"
                        className="form-control font-monospace"
                        placeholder="869.3"
                        {...register('cdd')}
                      />
                    </Campo>
                  </div>

                  <div className="col-6">
                    <Campo rotulo="CDU" htmlFor="cdu" erro={erros.cdu?.message}>
                      <input
                        id="cdu"
                        className="form-control font-monospace"
                        placeholder="821.134.3(81)-31"
                        {...register('cdu')}
                      />
                    </Campo>
                  </div>
                </div>

                <Campo rotulo="Área" htmlFor="area" erro={erros.area_id?.message}>
                  <Controller
                    control={control}
                    name="area_id"
                    render={({ field }) => (
                      <select
                        id="area"
                        className="form-select"
                        value={field.value}
                        onChange={(e) => aoMudarArea(e, field)}
                        onBlur={field.onBlur}
                      >
                        <option value="">Sem área</option>

                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.codigo} · {area.nome}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </Campo>

                <Campo
                  rotulo="Sub-área"
                  htmlFor="subarea"
                  erro={erros.subarea_id?.message}
                >
                  <Controller
                    control={control}
                    name="subarea_id"
                    render={({ field }) => (
                      <select
                        id="subarea"
                        className={classes(
                          'form-select',
                          erros.subarea_id && 'is-invalid',
                        )}
                        disabled={!areaId}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      >
                        <option value="">Sem sub-área</option>

                        {subareas.map((subarea) => (
                          <option key={subarea.id} value={subarea.id}>
                            {subarea.nome}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </Campo>
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-header">
                <h2 className="h6 mb-1">Capa</h2>

                <p className="small text-body-secondary mb-0">
                  Escolha uma capa encontrada ou envie do computador. A imagem é salva no servidor.
                </p>
              </div>

              <div className="card-body d-flex flex-column gap-3">
                <div className="d-flex gap-3 align-items-start">
                  <div style={LARGURA_CAPA}>
                    <Capa
                      key={urlPreviaCapa() ?? 'sem-capa'}
                      titulo={tituloDigitado || 'livro'}
                      url={urlPreviaCapa()}
                    />
                  </div>

                  <div className="small text-body-secondary flex-grow-1">
                    {situacaoCapa()}

                    {(escolhaCapa || capaAtual) && (
                      <div className="mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          disabled={removerCapa.isPending}
                          onClick={aoDescartarCapa}
                        >
                          {removerCapa.isPending ? (
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              aria-hidden="true"
                            />
                          ) : (
                            <i className="bi bi-x-lg me-1" aria-hidden="true" />
                          )}
                          {escolhaCapa
                            ? 'Descartar escolha'
                            : 'Remover capa'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {capasEncontradas.length > 0 && (
                  <div>
                    <span className="form-label d-block">Capas encontradas</span>

                    <div className="d-flex gap-2 flex-wrap">
                      {capasEncontradas.map(candidataCapa)}
                    </div>
                  </div>
                )}

                <SeletorArquivo
                  value={escolhaCapa?.tipo === 'arquivo'
                    ? escolhaCapa.arquivo
                    : null}
                  onChange={aoEscolherCapa}
                  maxBytes={TAMANHO_MAXIMO_CAPA}
                  aoErrar={setErroCapa}
                  invalido={!!erroCapa}
                  dica="JPG ou PNG até 5 MB"
                />

                {erroCapa && (
                  <span className="small text-danger">{erroCapa}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={classes(
            'd-flex',
            'justify-content-end',
            'gap-2',
            'border-top',
            'pt-3',
            'pb-3',
            'mt-4',
          )}
        >
          <button
            type="button"
            className="btn btn-secondary"
            disabled={salvar.isPending}
            onClick={fechar}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={salvar.isPending}
          >
            {salvar.isPending ? (
              <span
                className="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              />
            ) : (
              <i className="bi bi-check2 me-1" aria-hidden="true" />
            )}
            Salvar
          </button>
        </div>
      </form>
    );
  }

  function conteudo() {
    if (carregando) return <Carregando />;

    if (editando && livro.error) {
      return <ErroCarregamento erro={livro.error} aoTentar={livro.refetch} />;
    }

    return formulario();
  }

  return (
    <Modal
      aberto
      aoFechar={fechar}
      titulo={titulo}
      descricao={descricao}
      tamanho="grande"
      bloqueado={salvar.isPending}
    >
      {conteudo()}
    </Modal>
  );
}
