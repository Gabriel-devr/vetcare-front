import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Usado pelos testes (Vitest). */
export const server = setupServer(...handlers)
