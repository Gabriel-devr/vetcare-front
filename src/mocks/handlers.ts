import { http, HttpResponse } from 'msw'
import type {
  Animal,
  Configuracao,
  Consulta,
  Servico,
  Tutor,
  Usuario,
  Veterinario,
} from '../api/types'

/**
 * API simulada (MSW) para desenvolver e testar o front sem o backend/Supabase.
 * Ative com VITE_USE_MOCKS=true. Qualquer usuário abaixo entra com a senha SENHA_MOCK.
 */
export const SENHA_MOCK = 'Demo1234'

const ids = {
  admin: '00000000-0000-4000-8000-000000000001',
  recepcao: '00000000-0000-4000-8000-000000000002',
  vetAna: '00000000-0000-4000-8000-000000000003',
  vetCarlos: '00000000-0000-4000-8000-000000000004',
  tutorMaria: '00000000-0000-4000-8000-000000000005',
}

export const usuariosMock: Usuario[] = [
  { id: ids.admin, nome: 'Administrador VetCare', email: 'admin@vetcare.local', perfil: 'Admin', ativo: true },
  { id: ids.recepcao, nome: 'Recepção VetCare', email: 'recepcao@vetcare.local', perfil: 'Recepcionista', ativo: true },
  { id: ids.vetAna, nome: 'Dra. Ana Souza', email: 'ana.vet@vetcare.local', perfil: 'Veterinario', ativo: true },
  { id: ids.vetCarlos, nome: 'Dr. Carlos Lima', email: 'carlos.vet@vetcare.local', perfil: 'Veterinario', ativo: true },
  { id: ids.tutorMaria, nome: 'Maria Oliveira', email: 'maria.tutor@vetcare.local', perfil: 'Tutor', ativo: true },
]

const veterinarios: Veterinario[] = [
  { id: 'v1', usuarioId: ids.vetAna, nome: 'Dra. Ana Souza', email: 'ana.vet@vetcare.local', crmv: 'CRMV-BA 12345', especialidade: 'Clínica geral', ativo: true },
  { id: 'v2', usuarioId: ids.vetCarlos, nome: 'Dr. Carlos Lima', email: 'carlos.vet@vetcare.local', crmv: 'CRMV-BA 67890', especialidade: 'Dermatologia', ativo: true },
]

const servicos: Servico[] = [
  { id: 's1', nome: 'Consulta clínica', preco: 150, duracaoMinutos: 30, ativo: true },
  { id: 's2', nome: 'Vacinação', preco: 90, duracaoMinutos: 15, ativo: true },
  { id: 's3', nome: 'Retorno', preco: 0, duracaoMinutos: 30, ativo: true },
  { id: 's4', nome: 'Consulta especializada', preco: 250, duracaoMinutos: 60, ativo: true },
]

const configuracao: Configuracao = {
  nomeClinica: 'Clínica Veterinária VetCare',
  telefone: '(71) 3333-0000',
  horarioAbertura: '08:00:00',
  horarioFechamento: '18:00:00',
  diasAntecedenciaLembreteVacina: 7,
  emailEnvio: 'nao-responda@vetcare.local',
}

const tutores: Tutor[] = [
  { id: 't1', nome: 'Maria Oliveira', cpf: '52998224725', telefone: '(71) 99999-0001', email: 'maria.tutor@vetcare.local', endereco: 'Rua da Clínica, 100 - Salvador/BA', aceitaEmails: true, usuarioId: ids.tutorMaria, quantidadeAnimais: 2 },
  { id: 't2', nome: 'Luana Ribeiro', cpf: '11144477735', telefone: '(71) 99301-5520', email: 'luana.r@email.com', endereco: null, aceitaEmails: true, usuarioId: null, quantidadeAnimais: 1 },
]

const animais: Animal[] = [
  { id: 'a1', nome: 'Thor', especie: 'Cachorro', raca: 'Labrador', sexo: 'Macho', dataNascimento: '2021-05-10', peso: 28.5, observacoes: null, tutorId: 't1', tutorNome: 'Maria Oliveira' },
  { id: 'a2', nome: 'Mia', especie: 'Gato', raca: 'SRD', sexo: 'Femea', dataNascimento: '2023-02-01', peso: 4.2, observacoes: null, tutorId: 't1', tutorNome: 'Maria Oliveira' },
  { id: 'a3', nome: 'Pipoca', especie: 'Cachorro', raca: 'Poodle', sexo: 'Femea', dataNascimento: '2020-08-20', peso: 6.1, observacoes: 'Alergia a dipirona', tutorId: 't2', tutorNome: 'Luana Ribeiro' },
]

const consultas: Consulta[] = []

function pagina<T>(itens: T[], url: URL) {
  const p = Number(url.searchParams.get('pagina') ?? 1)
  const tamanho = Number(url.searchParams.get('tamanhoPagina') ?? 20)
  return {
    itens: itens.slice((p - 1) * tamanho, p * tamanho),
    pagina: p,
    tamanhoPagina: tamanho,
    total: itens.length,
    totalPaginas: Math.ceil(itens.length / tamanho),
  }
}

function problema(status: number, title: string, detail: string) {
  return HttpResponse.json({ status, title, detail }, { status })
}

/** Perfil do usuário a partir do token simulado "mock.<id>". */
function usuarioDoToken(request: Request): Usuario | null {
  const id = request.headers.get('Authorization')?.replace('Bearer mock.', '')
  return usuariosMock.find((u) => u.id === id) ?? null
}

export const handlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    const { email, senha } = (await request.json()) as { email: string; senha: string }
    const usuario = usuariosMock.find((u) => u.email === email.trim().toLowerCase())
    if (!usuario || senha !== SENHA_MOCK) return problema(401, 'Não autorizado', 'E-mail ou senha inválidos.')
    if (!usuario.ativo) return problema(401, 'Não autorizado', 'Usuário inativo. Procure o administrador.')
    return HttpResponse.json({
      token: `mock.${usuario.id}`,
      expiraEm: new Date(Date.now() + 8 * 3600_000).toISOString(),
      usuario,
    })
  }),

  http.get('*/api/auth/me', ({ request }) => {
    const usuario = usuarioDoToken(request)
    return usuario ? HttpResponse.json(usuario) : problema(401, 'Não autorizado', 'Sessão inválida.')
  }),

  http.get('*/api/usuarios', ({ request }) => {
    if (usuarioDoToken(request)?.perfil !== 'Admin') return problema(403, 'Acesso negado', 'Você não tem permissão.')
    return HttpResponse.json(pagina(usuariosMock, new URL(request.url)))
  }),

  http.get('*/api/veterinarios', () => HttpResponse.json(veterinarios)),
  http.get('*/api/servicos', () => HttpResponse.json(servicos)),
  http.get('*/api/configuracao', () => HttpResponse.json(configuracao)),

  http.get('*/api/tutores', ({ request }) => {
    const url = new URL(request.url)
    const busca = url.searchParams.get('busca')?.toLowerCase()
    const filtrados = busca
      ? tutores.filter((t) => t.nome.toLowerCase().includes(busca) || t.cpf.includes(busca.replace(/\D/g, '') || '§'))
      : tutores
    return HttpResponse.json(pagina(filtrados, url))
  }),

  http.get('*/api/animais', ({ request }) => HttpResponse.json(pagina(animais, new URL(request.url)))),

  http.get('*/api/me/animais', ({ request }) => {
    const usuario = usuarioDoToken(request)
    const tutor = tutores.find((t) => t.usuarioId === usuario?.id)
    if (!tutor) return problema(404, 'Não encontrado', 'Seu usuário ainda não está vinculado a um cadastro de tutor.')
    return HttpResponse.json(pagina(animais.filter((a) => a.tutorId === tutor.id), new URL(request.url)))
  }),

  http.get('*/api/consultas', ({ request }) => {
    const url = new URL(request.url)
    const data = url.searchParams.get('data')
    const vet = url.searchParams.get('veterinarioId')
    const lista = consultas.filter(
      (c) => (!data || c.dataHora.startsWith(data)) && (!vet || c.veterinarioId === vet),
    )
    return HttpResponse.json(pagina(lista, url))
  }),

  http.post('*/api/consultas', async ({ request }) => {
    const dto = (await request.json()) as { animalId: string; veterinarioId: string; servicoId: string; dataHora: string }
    const animal = animais.find((a) => a.id === dto.animalId)
    const vet = veterinarios.find((v) => v.id === dto.veterinarioId)
    const servico = servicos.find((s) => s.id === dto.servicoId)
    if (!animal || !vet || !servico) return problema(400, 'Regra de negócio violada', 'Animal, veterinário ou serviço não existe.')

    const ocupado = consultas.some(
      (c) => c.veterinarioId === vet.id && c.status === 'Agendada' && c.dataHora === dto.dataHora,
    )
    if (ocupado) return problema(409, 'Conflito', 'O veterinário já possui uma consulta nesse horário.')

    const nova: Consulta = {
      id: crypto.randomUUID(),
      dataHora: dto.dataHora,
      dataHoraFim: dto.dataHora,
      status: 'Agendada',
      motivoCancelamento: null,
      animalId: animal.id,
      animalNome: animal.nome,
      tutorId: animal.tutorId,
      tutorNome: animal.tutorNome,
      veterinarioId: vet.id,
      veterinarioNome: vet.nome,
      servicoId: servico.id,
      servicoNome: servico.nome,
    }
    consultas.push(nova)
    return HttpResponse.json(nova, { status: 201 })
  }),
]
