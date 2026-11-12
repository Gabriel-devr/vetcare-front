import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { definirAoNaoAutenticado } from '../api/client'
import { auth } from '../api/endpoints'
import type { LoginResposta } from '../api/types'
import { limparSessao, lerSessao, salvarSessao } from './tokenStorage'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [sessao, setSessao] = useState<LoginResposta | null>(() => lerSessao())

  const sair = useCallback(() => {
    limparSessao()
    setSessao(null)
    queryClient.clear()
  }, [queryClient])

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await auth.login(email.trim(), senha)
    salvarSessao(resposta)
    setSessao(resposta)
    return resposta.usuario
  }, [])

  useEffect(() => {
    definirAoNaoAutenticado(sair)
    return () => definirAoNaoAutenticado(null)
  }, [sair])

  const valor = useMemo(() => ({ usuario: sessao?.usuario ?? null, entrar, sair }), [sessao, entrar, sair])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
