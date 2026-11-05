import { classes } from '../utilitarios/classes';

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div
      className={classes(
        'd-flex',
        'align-items-center',
        'justify-content-center',
        'gap-2',
        'py-5',
        'text-body-secondary',
        'small',
      )}
      role="status"
    >
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />

      {texto}
    </div>
  );
}
