import { somenteDigitos } from './validadores';

export function mascararCpf(valor: string): string {
  const digitos = somenteDigitos(valor);
  const limitados = digitos.slice(0, 11);

  const comPrimeiroPonto = limitados.replace(/^(\d{3})(\d)/, '$1.$2');
  const comSegundoPonto = comPrimeiroPonto.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  const comHifen = comSegundoPonto.replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');

  return comHifen;
}

export function mascararCep(valor: string): string {
  const digitos = somenteDigitos(valor);
  const limitados = digitos.slice(0, 8);

  if (limitados.length <= 5) return limitados;

  const inicio = limitados.slice(0, 5);
  const fim = limitados.slice(5);

  return `${inicio}-${fim}`;
}

export function mascararData(valor: string): string {
  const digitos = somenteDigitos(valor);
  const limitados = digitos.slice(0, 8);

  const dia = limitados.slice(0, 2);
  const mes = limitados.slice(2, 4);
  const ano = limitados.slice(4);

  if (limitados.length > 4) return `${dia}/${mes}/${ano}`;

  if (limitados.length > 2) return `${dia}/${mes}`;

  return limitados;
}

export function dataParaIso(valor: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);

  if (!partes) return null;

  const [, dia, mes, ano] = partes;

  const numeroDia = Number(dia);
  const numeroMes = Number(mes);
  const numeroAno = Number(ano);

  const data = new Date(numeroAno, numeroMes - 1, numeroDia);

  const mesmoDia = data.getDate() === numeroDia;
  const mesmoMes = data.getMonth() === numeroMes - 1;
  const mesmoAno = data.getFullYear() === numeroAno;

  if (!mesmoDia || !mesmoMes || !mesmoAno) return null;

  return `${ano}-${mes}-${dia}`;
}

export function isoParaData(valor: string | null | undefined): string {
  const texto = valor ?? '';
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);

  if (!partes) return '';

  const [, ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}
