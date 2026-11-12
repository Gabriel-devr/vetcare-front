const CHAVE = 'vetcare.sessao'

/** Dados guardados entre recarregamentos da página. */
export interface SessaoSalva {
  token: string
  expiraEm: string
  usuario: { id: string; nome: string; email: string; perfil: string; ativo: boolean }
}

// localStorage pode lançar exceção (modo privado, dados bloqueados): nunca deixar isso derrubar o app.

export function lerSessao(): SessaoSalva | null {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null
    const sessao = JSON.parse(bruto) as SessaoSalva
    if (!sessao.token || new Date(sessao.expiraEm).getTime() <= Date.now()) {
      limparSessao()
      return null
    }
    return sessao
  } catch {
    return null
  }
}

export function salvarSessao(sessao: SessaoSalva): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    /* sem armazenamento: a sessão vale só até recarregar */
  }
}

export function limparSessao(): void {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    /* ignora */
  }
}

export function lerToken(): string | null {
  return lerSessao()?.token ?? null
}
