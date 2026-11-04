import { useState, type ChangeEvent } from 'react';
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { mensagemDeErro } from '../api/erros';
import { catalogo } from '../api/servicos';
import { classes } from '../utilitarios/classes';
import { mascararCep } from '../utilitarios/mascaras';
import { somenteDigitos, UFS } from '../utilitarios/validadores';
import { Campo } from './Campo';

export interface CamposEndereco {
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
}

interface Props<T extends CamposEndereco> {
  control: Control<T>;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
}

type CampoCep = ControllerRenderProps<CamposEndereco, 'cep'>;

export function EnderecoCampos<T extends CamposEndereco>(props: Props<T>) {
  const propsEndereco = props as unknown as Props<CamposEndereco>;
  const { control, register, setValue, errors } = propsEndereco;

  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function consultar(cep: string) {
    const digitos = somenteDigitos(cep);

    if (digitos.length !== 8) return;

    setBuscando(true);
    setAviso(null);

    try {
      const e = await catalogo.cep(digitos);
      const opcoes = { shouldValidate: true, shouldDirty: true } as const;

      if (e.uf) setValue('uf', e.uf, opcoes);
      if (e.cidade) setValue('cidade', e.cidade, opcoes);
      if (e.bairro) setValue('bairro', e.bairro, opcoes);
      if (e.rua) setValue('rua', e.rua, opcoes);
    } catch (erro) {
      setAviso(mensagemDeErro(erro));
    } finally {
      setBuscando(false);
    }
  }

  function aoDigitarCep(e: ChangeEvent<HTMLInputElement>, field: CampoCep) {
    const valor = mascararCep(e.target.value);

    field.onChange(valor);

    const digitos = somenteDigitos(valor);

    if (digitos.length === 8) void consultar(valor);
  }

  const dicaCep = buscando
    ? 'Buscando endereço…'
    : (aviso ?? undefined);

  return (
    <div className="row g-3">
      <div className="col-sm-5">
        <Campo
          rotulo="CEP"
          htmlFor="cep"
          erro={errors.cep?.message}
          dica={dicaCep}
        >
          <Controller
            control={control}
            name="cep"
            render={({ field }) => (
              <input
                id="cep"
                inputMode="numeric"
                autoComplete="postal-code"
                className={classes('form-control', errors.cep && 'is-invalid')}
                placeholder="00000-000"
                value={field.value}
                onChange={(e) => aoDigitarCep(e, field)}
                onBlur={field.onBlur}
              />
            )}
          />
        </Campo>
      </div>

      <div className="col-sm-3">
        <Campo rotulo="UF" htmlFor="uf" erro={errors.uf?.message}>
          <select
            id="uf"
            className={classes('form-select', errors.uf && 'is-invalid')}
            {...register('uf')}
          >
            <option value="">—</option>

            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="col-sm-4">
        <Campo rotulo="Cidade" htmlFor="cidade" erro={errors.cidade?.message}>
          <input
            id="cidade"
            autoComplete="address-level2"
            className={classes('form-control', errors.cidade && 'is-invalid')}
            {...register('cidade')}
          />
        </Campo>
      </div>

      <div className="col-sm-5">
        <Campo rotulo="Bairro" htmlFor="bairro" erro={errors.bairro?.message}>
          <input
            id="bairro"
            className={classes('form-control', errors.bairro && 'is-invalid')}
            {...register('bairro')}
          />
        </Campo>
      </div>

      <div className="col-sm-7">
        <Campo rotulo="Rua" htmlFor="rua" erro={errors.rua?.message}>
          <input
            id="rua"
            autoComplete="address-line1"
            className={classes('form-control', errors.rua && 'is-invalid')}
            {...register('rua')}
          />
        </Campo>
      </div>

      <div className="col-sm-4">
        <Campo
          rotulo="Número"
          htmlFor="numero"
          erro={errors.numero?.message}
          dica="Use S/N se não houver."
        >
          <input
            id="numero"
            className={classes('form-control', errors.numero && 'is-invalid')}
            {...register('numero')}
          />
        </Campo>
      </div>

      <div className="col-sm-8">
        <Campo
          rotulo="Complemento (opcional)"
          htmlFor="complemento"
          erro={errors.complemento?.message}
        >
          <input
            id="complemento"
            autoComplete="address-line2"
            className="form-control"
            {...register('complemento')}
          />
        </Campo>
      </div>
    </div>
  );
}
