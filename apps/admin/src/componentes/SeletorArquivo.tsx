import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { classes } from '../utilitarios/classes';

interface Props {
  value: File | null;
  onChange: (arquivo: File | null) => void;
  accept?: string;
  maxBytes?: number;
  aoErrar?: (mensagem: string) => void;
  titulo?: string;
  dica?: string;
  invalido?: boolean;
}

const UM_KB = 1024;

const UM_MB = 1024 * 1024;

const MINIATURA = { width: 48, height: 48 };

function formatarTamanho(bytes: number): string {
  if (bytes < UM_KB) return `${bytes} B`;

  if (bytes < UM_MB) {
    const kb = (bytes / UM_KB).toFixed(0);

    return `${kb} KB`;
  }

  const mb = (bytes / UM_MB).toFixed(1);
  const mbComVirgula = mb.replace('.', ',');

  return `${mbComVirgula} MB`;
}

function tipoAceito(arquivo: File, accept?: string): boolean {
  if (!accept) return true;

  const tipos = accept.split(',');

  return tipos.some((tipo) => {
    const limpo = tipo.trim();
    const curinga = limpo.endsWith('/*');

    if (curinga) {
      const prefixo = limpo.slice(0, -1);

      return arquivo.type.startsWith(prefixo);
    }

    return arquivo.type === limpo;
  });
}

export function SeletorArquivo(props: Props) {
  const {
    value,
    onChange,
    accept = 'image/jpeg,image/png',
    maxBytes,
    aoErrar,
    titulo = 'Arraste uma imagem ou clique para escolher',
    dica,
    invalido,
  } = props;

  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);

  const preview = useMemo(() => {
    const ehImagem = value?.type.startsWith('image/');

    if (!value || !ehImagem) return null;

    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function escolher(arquivo: File | undefined) {
    if (!arquivo) return;

    if (!tipoAceito(arquivo, accept)) {
      aoErrar?.('Formato de arquivo não aceito.');

      return;
    }

    if (maxBytes && arquivo.size > maxBytes) {
      const limite = formatarTamanho(maxBytes);

      aoErrar?.(`O arquivo deve ter no máximo ${limite}.`);

      return;
    }

    onChange(arquivo);
  }

  function aoArrastarPorCima(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();

    setArrastando(true);
  }

  function aoSoltar(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();

    setArrastando(false);

    const arquivo = e.dataTransfer.files?.[0];

    escolher(arquivo);
  }

  function aoSelecionar(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];

    escolher(arquivo);

    e.target.value = '';
  }

  function arquivoEscolhido(arquivo: File) {
    return (
      <div className="d-flex align-items-center gap-3">
        {preview ? (
          <img
            className={classes(
              'rounded',
              'object-fit-cover',
              'flex-shrink-0',
            )}
            style={MINIATURA}
            src={preview}
            alt=""
          />
        ) : (
          <span
            className={classes(
              'd-inline-flex',
              'align-items-center',
              'justify-content-center',
              'rounded',
              'bg-body-secondary',
              'flex-shrink-0',
            )}
            style={MINIATURA}
          >
            <i className="bi bi-file-earmark" aria-hidden="true" />
          </span>
        )}

        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div
            className={classes(
              'text-truncate',
              'small',
              'fw-semibold',
            )}
            title={arquivo.name}
          >
            {arquivo.name}
          </div>

          <div className="small text-body-secondary">
            {formatarTamanho(arquivo.size)} ·{' '}

            <button
              type="button"
              className={classes(
                'btn',
                'btn-link',
                'btn-sm',
                'p-0',
                'align-baseline',
              )}
              onClick={() => input.current?.click()}
            >
              trocar
            </button>
          </div>
        </div>

        <button
          type="button"
          className="btn-close"
          aria-label="Remover arquivo"
          onClick={() => onChange(null)}
        />
      </div>
    );
  }

  function areaVazia() {
    return (
      <label
        htmlFor={inputId}
        className={classes(
          'd-flex',
          'flex-column',
          'align-items-center',
          'gap-1',
          'text-center',
          'w-100',
          'text-body-secondary',
        )}
        style={{ cursor: 'pointer' }}
      >
        <i className="bi bi-cloud-arrow-up fs-3" aria-hidden="true" />

        <span className="small fw-semibold text-body">{titulo}</span>

        {dica && <span className="small">{dica}</span>}
      </label>
    );
  }

  return (
    <div
      className={classes(
        'border',
        'border-2',
        'rounded',
        'p-3',
        arrastando && 'border-primary',
        arrastando && 'bg-primary-subtle',
        invalido && 'border-danger',
      )}
      style={{ borderStyle: 'dashed' }}
      onDragOver={aoArrastarPorCima}
      onDragLeave={() => setArrastando(false)}
      onDrop={aoSoltar}
    >
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={accept}
        className="visually-hidden"
        onChange={aoSelecionar}
      />

      {value
        ? arquivoEscolhido(value)
        : areaVazia()}
    </div>
  );
}
