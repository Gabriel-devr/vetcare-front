import { createContext, useContext } from 'react'
import type { Usuario } from '../api/types'

export interface AuthContextValor {
  usuario: Usuario | null
  entrar: (email: string, senha: string) => Promise<Usuario>
  sair: () => void
}

export const AuthContext = createContext<AuthContextValor | null>(null)

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return contexto
}
