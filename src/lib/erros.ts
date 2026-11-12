import { ApiError } from '../api/client'

export function mensagemErro(erro: unknown): string {
  return erro instanceof ApiError ? erro.message : 'Algo deu errado. Tente novamente.'
}
