import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { salvarSessao } from '../auth/tokenStorage'
import { usuariosMock } from '../mocks/handlers'

export function logarComo(email: string) {
  const usuario = usuariosMock.find((u) => u.email === email)!
  salvarSessao({ token: `mock.${usuario.id}`, expiraEm: new Date(Date.now() + 60_000).toISOString(), usuario })
}

export function renderApp(rota = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[rota]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
