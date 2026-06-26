// Períodos do Dashboard. Retornam intervalo [from, to) em ISO.

export type Periodo = "hoje" | "ontem" | "semana" | "mes" | "personalizado";

export interface Range {
  from: string;
  to: string;
  label: string;
}

export const PERIODO_LABEL: Record<Periodo, string> = {
  hoje: "Hoje",
  ontem: "Ontem",
  semana: "Esta semana",
  mes: "Este mês",
  personalizado: "Personalizado",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function resolveRange(
  periodo: Periodo,
  de?: string,
  ate?: string
): Range {
  const now = new Date();
  const hoje = startOfDay(now);

  switch (periodo) {
    case "ontem": {
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      return { from: ontem.toISOString(), to: hoje.toISOString(), label: "Ontem" };
    }
    case "semana": {
      const ini = new Date(hoje);
      const dia = (ini.getDay() + 6) % 7; // segunda = 0
      ini.setDate(ini.getDate() - dia);
      return { from: ini.toISOString(), to: now.toISOString(), label: "Esta semana" };
    }
    case "mes": {
      const ini = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      return { from: ini.toISOString(), to: now.toISOString(), label: "Este mês" };
    }
    case "personalizado": {
      if (de && ate) {
        const from = startOfDay(new Date(de));
        const toEnd = startOfDay(new Date(ate));
        toEnd.setDate(toEnd.getDate() + 1);
        return {
          from: from.toISOString(),
          to: toEnd.toISOString(),
          label: `${de} a ${ate}`,
        };
      }
      // sem datas → cai para hoje
      return { from: hoje.toISOString(), to: now.toISOString(), label: "Hoje" };
    }
    case "hoje":
    default:
      return { from: hoje.toISOString(), to: now.toISOString(), label: "Hoje" };
  }
}
