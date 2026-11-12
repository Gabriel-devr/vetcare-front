import { describe, expect, it } from 'vitest'
import { dataBr, dataHoraBr, dataPorExtenso, hojeISO, hora, horaCurta, idade, montarDataHora } from './datas'

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

  it('calcula a idade em anos e meses', () => {
    const hoje = new Date(2026, 10, 12)
    expect(idade('2020-11-12', hoje)).toBe('6 anos')
    expect(idade('2025-11-13', hoje)).toBe('11 meses')
    expect(idade('2025-10-01', hoje)).toBe('1 ano')
    expect(idade('2026-10-20', hoje)).toBe('0 meses')
  })

  it('encurta HH:mm:ss', () => {
    expect(horaCurta('08:00:00')).toBe('08:00')
  })
})
