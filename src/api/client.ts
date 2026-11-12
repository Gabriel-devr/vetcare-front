import { lerToken } from '../auth/tokenStorage'
import type { ProblemDetails } from './types'

/** Base da API. Vazio = mesma origem (em desenvolvimento o Vite repassa /api para o backend). */
const BASE_URL: string = import.meta.env.VITE_API_URL ?? ''

/** Erro lançado quando a API responde com status fora de 2xx. */
export class ApiError extends Error {
  readonly status: number
  readonly titulo: string
  /** Erros por campo (ex.: { Cpf: ["CPF inválido."] }), quando a API devolve validação. */
  readonly erros: Record<string, string[]>

  constructor(status: number, titulo: string, detalhe: string, erros: Record<string, string[]> = {}) {
    super(detalhe)
    this.name = 'ApiError'
    this.status = status
    this.titulo = titulo
    this.erros = erros
  }

  get semPermissao() {
    return this.status === 403
  }
  get naoAutenticado() {
    return this.status === 401
  }
  get conflito() {
    return this.status === 409
  }
}

type Parametros = Record<string, string | number | boolean | null | undefined>

interface Opcoes {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Parametros
  signal?: AbortSignal
  /** Rotas públicas (login) não enviam token nem disparam o logout em 401. */
  publica?: boolean
}

let aoNaoAutenticado: (() => void) | null = null

/** O contexto de autenticação registra aqui o que fazer quando o token expira ou é recusado. */
export function definirAoNaoAutenticado(callback: (() => void) | null) {
  aoNaoAutenticado = callback
}

function montarUrl(caminho: string, query?: Parametros): string {
  const url = `${BASE_URL}${caminho}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(query)) {
    if (valor !== undefined && valor !== null && valor !== '') params.set(chave, String(valor))
  }
  const texto = params.toString()
  return texto ? `${url}?${texto}` : url
}

async function lerErro(resposta: Response): Promise<ApiError> {
  let corpo: ProblemDetails = {}
  try {
    corpo = (await resposta.json()) as ProblemDetails
  } catch {
    /* corpo vazio ou não-JSON */
  }

  const padrao: Record<number, string> = {
    401: 'Sua sessão expirou. Entre novamente.',
    403: 'Você não tem permissão para fazer isso.',
    404: 'Não encontrado.',
    500: 'Erro interno do servidor. Tente novamente em instantes.',
  }
  const erros = corpo.errors ?? {}
  const primeiroErro = Object.values(erros)[0]?.[0]
  const detalhe =
    corpo.detail ?? primeiroErro ?? padrao[resposta.status] ?? `Falha na requisição (${resposta.status}).`

  return new ApiError(resposta.status, corpo.title ?? 'Erro', detalhe, erros)
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { method = 'GET', body, query, signal, publica = false } = opcoes
  const cabecalhos: Record<string, string> = { Accept: 'application/json' }

  if (body !== undefined) cabecalhos['Content-Type'] = 'application/json'
  if (!publica) {
    const token = lerToken()
    if (token) cabecalhos.Authorization = `Bearer ${token}`
  }

  let resposta: Response
  try {
    resposta = await fetch(montarUrl(caminho, query), {
      method,
      headers: cabecalhos,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') throw erro
    throw new ApiError(0, 'Sem conexão', 'Não foi possível falar com o servidor. Verifique sua conexão.')
  }

  if (!resposta.ok) {
    const erro = await lerErro(resposta)
    if (erro.naoAutenticado && !publica) aoNaoAutenticado?.()
    throw erro
  }

  if (resposta.status === 204) return undefined as T
  return (await resposta.json()) as T
}
