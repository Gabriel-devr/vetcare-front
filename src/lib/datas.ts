/**
 * Datas da agenda são o horário local da clínica, sem fuso ("2030-01-08T10:00:00").
 * Estas funções trabalham só com o TEXTO, sem passar por Date com fuso: assim 10:00 continua 10:00
 * em qualquer computador e a API recebe exatamente o que o usuário escolheu.
 */

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

/** "2030-01-08T10:00:00" → "10:00" */
export function hora(dataHora: string): string {
  return dataHora.slice(11, 16)
}

/** "2030-01-08T10:00:00" → "08/01/2030" */
export function dataBr(dataHora: string): string {
  const [ano, mes, dia] = dataHora.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

/** "2030-01-08T10:00:00" → "08/01/2030 10:00" */
export function dataHoraBr(dataHora: string): string {
  return `${dataBr(dataHora)} ${hora(dataHora)}`
}

/** Data de hoje no computador do usuário, como "yyyy-MM-dd" (para o filtro e o campo de data). */
export function hojeISO(agora: Date = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

/** "2026-10-19" → "Segunda-feira, 19/10/2026" */
export function dataPorExtenso(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-').map(Number)
  const diaSemana = DIAS_SEMANA[new Date(ano, mes - 1, dia).getDay()]
  return `${diaSemana}, ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`
}

/** Junta "yyyy-MM-dd" e "HH:mm" no formato que a API espera. */
export function montarDataHora(dataISO: string, horaTexto: string): string {
  return `${dataISO}T${horaTexto.slice(0, 5)}:00`
}

/** "08:00:00" → "08:00" */
export function horaCurta(hhmmss: string): string {
  return hhmmss.slice(0, 5)
}
