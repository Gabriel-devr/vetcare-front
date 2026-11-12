import { Navigate, Route, Routes } from 'react-router-dom'
import { paginaInicial } from './auth/perfis'
import { RotaProtegida } from './auth/RotaProtegida'
import { useAuth } from './auth/useAuth'
import { AppShell } from './components/layout/AppShell'
import { AgendaPage } from './features/agenda/AgendaPage'
import { InicioPage } from './features/agenda/InicioPage'
import { MinhaAgendaPage } from './features/agenda/MinhaAgendaPage'
import { LoginPage } from './features/auth/LoginPage'
import { ServicosPage } from './features/catalogo/ServicosPage'
import { MeusAnimaisPage } from './features/tutor/MeusAnimaisPage'
import { MinhasConsultasPage } from './features/tutor/MinhasConsultasPage'
import { AnimalPage } from './features/tutores/AnimalPage'
import { TutorEditarPage } from './features/tutores/TutorEditarPage'
import { TutorNovoPage } from './features/tutores/TutorNovoPage'
import { TutoresPage } from './features/tutores/TutoresPage'
import { UsuariosPage } from './features/usuarios/UsuariosPage'

function Raiz() {
  const { usuario } = useAuth()
  return <Navigate to={usuario ? paginaInicial(usuario.perfil) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Raiz />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RotaProtegida />}>
        <Route element={<AppShell />}>
          <Route element={<RotaProtegida perfis={['Admin', 'Recepcionista']} />}>
            <Route path="/inicio" element={<InicioPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/tutores" element={<TutoresPage />} />
            <Route path="/tutores/novo" element={<TutorNovoPage />} />
            <Route path="/tutores/:id" element={<TutorEditarPage />} />
            <Route path="/tutores/:tutorId/animais/novo" element={<AnimalPage />} />
            <Route path="/tutores/:tutorId/animais/:animalId" element={<AnimalPage />} />
          </Route>

          <Route element={<RotaProtegida perfis={['Admin']} />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
          </Route>

          <Route element={<RotaProtegida perfis={['Veterinario']} />}>
            <Route path="/minha-agenda" element={<MinhaAgendaPage />} />
          </Route>

          <Route element={<RotaProtegida perfis={['Tutor']} />}>
            <Route path="/meus-animais" element={<MeusAnimaisPage />} />
            <Route path="/minhas-consultas" element={<MinhasConsultasPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Raiz />} />
    </Routes>
  )
}
