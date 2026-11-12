
const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function hora(dataHora: string): string {
  return dataHora.slice(11, 16)
}

export function dataBr(dataHora: string): string {
  const [ano, mes, dia] = dataHora.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function dataHoraBr(dataHora: string): string {
  return `${dataBr(dataHora)} ${hora(dataHora)}`
}

export function hojeISO(agora: Date = new Date()): string {
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

export function dataPorExtenso(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-').map(Number)
  const diaSemana = DIAS_SEMANA[new Date(ano, mes - 1, dia).getDay()]
  return `${diaSemana}, ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`
}

export function montarDataHora(dataISO: string, horaTexto: string): string {
  return `${dataISO}T${horaTexto.slice(0, 5)}:00`
}

export function idade(nascimentoISO: string, hoje: Date = new Date()): string {
  const [ano, mes, dia] = nascimentoISO.slice(0, 10).split('-').map(Number)
  let meses = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() + 1 - mes)
  if (hoje.getDate() < dia) meses--
  if (meses < 0) meses = 0
  if (meses >= 12) {
    const anos = Math.floor(meses / 12)
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  }
  return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
}

export function horaCurta(hhmmss: string): string {
  return hhmmss.slice(0, 5)
}
