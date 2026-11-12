import { describe, expect, it } from 'vitest'
import { dataBr, dataHoraBr, dataPorExtenso, hojeISO, hora, horaCurta, montarDataHora } from './datas'

describe('datas (horário local da clínica, sem fuso)', () => {
  it('lê hora e data do texto sem converter fuso', () => {
    expect(hora('2030-01-08T10:00:00')).toBe('10:00')
    expect(dataBr('2030-01-08T10:00:00')).toBe('08/01/2030')
    expect(dataHoraBr('2030-01-08T17:30:00')).toBe('08/01/2030 17:30')
  })

  it('monta o texto que a API espera', () => {
    expect(montarDataHora('2030-01-08', '10:00')).toBe('2030-01-08T10:00:00')
    expect(montarDataHora('2030-01-08', '09:30:00')).toBe('2030-01-08T09:30:00')
  })

  it('formata hoje e o dia por extenso', () => {
    expect(hojeISO(new Date(2026, 9, 19))).toBe('2026-10-19')
    expect(dataPorExtenso('2026-10-19')).toBe('Segunda-feira, 19/10/2026')
  })

  it('encurta HH:mm:ss', () => {
    expect(horaCurta('08:00:00')).toBe('08:00')
  })
})
