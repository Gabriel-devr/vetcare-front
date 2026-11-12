import type { LoginResposta } from '../api/types'

const CHAVE = 'vetcare.sessao'

export function lerSessao(): LoginResposta | null {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null
    const sessao = JSON.parse(bruto) as LoginResposta
    if (!sessao.token || new Date(sessao.expiraEm).getTime() <= Date.now()) {
      limparSessao()
      return null
    }
    return sessao
  } catch {
    return null
  }
}

export function salvarSessao(sessao: LoginResposta): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    return
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    return
  }
}

export function lerToken(): string | null {
  return lerSessao()?.token ?? null
}
