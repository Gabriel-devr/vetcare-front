import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { salvarSessao } from '../auth/tokenStorage'
import { SENHA_MOCK } from '../mocks/handlers'
import { server } from '../mocks/server'
import { ApiError, definirAoNaoAutenticado } from './client'
import { auth, catalogo, consultas, usuarios } from './endpoints'

describe('cliente da API', () => {
  it('faz login e devolve token e usuário', async () => {
    const resposta = await auth.login('recepcao@vetcare.local', SENHA_MOCK)
    expect(resposta.token).toBeTruthy()
    expect(resposta.usuario.perfil).toBe('Recepcionista')
  })

  it('transforma a resposta de erro em ApiError com a mensagem da API', async () => {
    const erro = await auth.login('recepcao@vetcare.local', 'errada').catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ApiError)
    expect((erro as ApiError).status).toBe(401)
    expect((erro as ApiError).message).toBe('E-mail ou senha inválidos.')
  })

  it('envia o token salvo no cabeçalho Authorization', async () => {
    let cabecalho: string | null = null
    server.use(
      http.get('*/api/servicos', ({ request }) => {
        cabecalho = request.headers.get('Authorization')
        return HttpResponse.json([])
      }),
    )
    salvarSessao({
      token: 'mock.abc',
      expiraEm: new Date(Date.now() + 60_000).toISOString(),
      usuario: { id: '1', nome: 'X', email: 'x@x', perfil: 'Admin', ativo: true },
    })

    await catalogo.servicos()
    expect(cabecalho).toBe('Bearer mock.abc')
  })

  it('avisa quando uma rota protegida responde 401', async () => {
    const aoSair = vi.fn()
    definirAoNaoAutenticado(aoSair)
    server.use(http.get('*/api/auth/me', () => HttpResponse.json({ status: 401 }, { status: 401 })))

    await expect(auth.me()).rejects.toMatchObject({ status: 401 })
    expect(aoSair).toHaveBeenCalledOnce()
    definirAoNaoAutenticado(null)
  })

  it('mapeia 403 e 409 e lê erros de validação por campo', async () => {
    server.use(
      http.get('*/api/usuarios', () =>
        HttpResponse.json({ status: 403, title: 'Acesso negado', detail: 'Você não tem permissão.' }, { status: 403 }),
      ),
      http.post('*/api/consultas', () =>
        HttpResponse.json(
          { status: 409, title: 'Conflito', detail: 'O veterinário já possui uma consulta nesse horário.' },
          { status: 409 },
        ),
      ),
    )

    const proibido = (await usuarios.listar().catch((e: unknown) => e)) as ApiError
    expect(proibido.semPermissao).toBe(true)

    const conflito = (await consultas
      .agendar({ animalId: 'a', veterinarioId: 'v', servicoId: 's', dataHora: '2030-01-08T10:00:00' })
      .catch((e: unknown) => e)) as ApiError
    expect(conflito.conflito).toBe(true)
    expect(conflito.message).toContain('já possui uma consulta')
  })

  it('devolve ApiError de rede quando o servidor não responde', async () => {
    server.use(http.get('*/api/configuracao', () => HttpResponse.error()))
    await expect(catalogo.configuracao()).rejects.toMatchObject({ status: 0, titulo: 'Sem conexão' })
  })
})
