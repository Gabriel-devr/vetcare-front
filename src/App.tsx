import { useQuery } from '@tanstack/react-query'
import { saude } from './api/endpoints'

/**
 * Placeholder da Fase 0: confirma que o front fala com a API.
 * A partir da Fase 1 este arquivo passa a ter as rotas (login, menu por perfil, telas).
 */
export default function App() {
  const { data, error, isPending } = useQuery({ queryKey: ['saude'], queryFn: saude.verificar })

  return (
    <main style={{ maxWidth: 480, margin: '15vh auto', padding: 'var(--espaco-5)', textAlign: 'center' }}>
      <h1>VetCare</h1>
      <p style={{ color: 'var(--cor-texto-suave)', marginTop: 'var(--espaco-2)' }}>
        Front-end em construção — Fase 0 (setup)
      </p>
      <p role="status" style={{ marginTop: 'var(--espaco-5)' }}>
        {isPending && 'Verificando a API…'}
        {data && `API: ${data.status}`}
        {error && `API indisponível: ${error.message}`}
      </p>
    </main>
  )
}
