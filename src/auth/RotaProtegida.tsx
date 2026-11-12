import { Navigate, Outlet } from 'react-router-dom'
import type { Perfil } from '../api/types'
import { useAuth } from './useAuth'
import { paginaInicial } from './perfis'

export function RotaProtegida({ perfis }: { perfis?: Perfil[] }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to={paginaInicial(usuario.perfil)} replace />

  return <Outlet />
}
