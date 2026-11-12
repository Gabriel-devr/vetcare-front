import { describe, expect, it } from 'vitest'
import { lerDecimal, mascararCpf, mascararTelefone, validarCpf } from './formatar'

describe('formatar', () => {
  it('valida CPF pelos dígitos verificadores', () => {
    expect(validarCpf('529.982.247-25')).toBe(true)
    expect(validarCpf('111.444.777-35')).toBe(true)
    expect(validarCpf('529.982.247-26')).toBe(false)
    expect(validarCpf('111.111.111-11')).toBe(false)
    expect(validarCpf('123')).toBe(false)
  })

  it('aplica máscara de CPF e telefone enquanto digita', () => {
    expect(mascararCpf('52998224725')).toBe('529.982.247-25')
    expect(mascararCpf('5299')).toBe('529.9')
    expect(mascararTelefone('71988887777')).toBe('(71) 98888-7777')
    expect(mascararTelefone('7133334400')).toBe('(71) 3333-4400')
  })

  it('lê decimal com vírgula', () => {
    expect(lerDecimal('4,2')).toBe(4.2)
    expect(lerDecimal('32.4')).toBe(32.4)
    expect(lerDecimal('')).toBeNull()
    expect(lerDecimal('abc')).toBeNull()
  })
})
