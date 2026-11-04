import type { Area } from './api/tipos';

export interface SelecaoAreas {
  areas: number[];
  subareas: number[];
}

export type EstadoArea = 'marcada' | 'parcial' | 'vazia';

function idValido(numero: number): boolean {
  return Number.isInteger(numero) && numero > 0;
}

function idsDasSubareas(area: Area): number[] {
  const subareas = area.subareas ?? [];

  return subareas.map((sub) => sub.id);
}

export function lerIds(valor: string | null): number[] {
  if (!valor) return [];

  const partes = valor.split(',');
  const numeros = partes.map(Number);
  const validos = numeros.filter(idValido);
  const unicos = new Set(validos);

  return [...unicos];
}

export function escreverIds(ids: number[]): string {
  const copia = [...ids];
  const ordenados = copia.sort((a, b) => a - b);

  return ordenados.join(',');
}

export function estadoArea(selecao: SelecaoAreas, area: Area): EstadoArea {
  if (selecao.areas.includes(area.id)) return 'marcada';

  const subareas = idsDasSubareas(area);
  const algumaMarcada = subareas.some((id) => selecao.subareas.includes(id));

  return algumaMarcada
    ? 'parcial'
    : 'vazia';
}

export function subareaMarcada(selecao: SelecaoAreas, area: Area, subareaId: number): boolean {
  const areaInteira = selecao.areas.includes(area.id);
  const subareaAvulsa = selecao.subareas.includes(subareaId);

  return areaInteira || subareaAvulsa;
}

export function alternarArea(selecao: SelecaoAreas, area: Area): SelecaoAreas {
  const subareasDaArea = idsDasSubareas(area);
  const outrasSubareas = selecao.subareas.filter((id) => !subareasDaArea.includes(id));

  if (estadoArea(selecao, area) === 'marcada') {
    const outrasAreas = selecao.areas.filter((id) => id !== area.id);

    return { areas: outrasAreas, subareas: outrasSubareas };
  }

  const comEstaArea = [...selecao.areas, area.id];

  return { areas: comEstaArea, subareas: outrasSubareas };
}

export function alternarSubarea(
  selecao: SelecaoAreas,
  area: Area,
  subareaId: number,
): SelecaoAreas {
  const subareasDaArea = idsDasSubareas(area);
  const outrasAreas = selecao.areas.filter((id) => id !== area.id);
  const outrasSubareas = selecao.subareas.filter((id) => !subareasDaArea.includes(id));

  let marcadas = selecao.areas.includes(area.id)
    ? subareasDaArea
    : subareasDaArea.filter((id) => selecao.subareas.includes(id));

  marcadas = marcadas.includes(subareaId)
    ? marcadas.filter((id) => id !== subareaId)
    : [...marcadas, subareaId];

  const todasMarcadas = subareasDaArea.length > 0 && marcadas.length === subareasDaArea.length;

  if (todasMarcadas) {
    return {
      areas: [...outrasAreas, area.id],
      subareas: outrasSubareas,
    };
  }

  return {
    areas: outrasAreas,
    subareas: [...outrasSubareas, ...marcadas],
  };
}

export function totalSelecionado(selecao: SelecaoAreas): number {
  return selecao.areas.length + selecao.subareas.length;
}
