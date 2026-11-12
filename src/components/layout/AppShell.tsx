import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { itensMenu, rotuloPerfil } from '../../auth/perfis'

export function AppShell() {
  const { usuario, sair } = useAuth()
  if (!usuario) return null

  return (
    <div className="shell">
      <aside className="menu">
        <div className="menu-marca">VetCare</div>
        <nav className="menu-itens" aria-label="Principal">
          {itensMenu(usuario.perfil).map((item) => (
            <NavLink key={item.caminho} to={item.caminho} className="menu-link">
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="menu-usuario">
          <strong>{usuario.nome}</strong>
          <span>{rotuloPerfil(usuario.perfil)}</span>
          <button type="button" className="menu-sair" onClick={sair}>
            Sair
          </button>
        </div>
      </aside>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}
