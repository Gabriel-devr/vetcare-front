import { http, HttpResponse } from 'msw'
import type {
  Animal,
  Configuracao,
  Consulta,
  SalvarAnimal,
  SalvarTutor,
  Servico,
  Tutor,
  Usuario,
  Veterinario,
} from '../api/types'

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

function naoEncontrado(recurso: string) {
  return problema(404, 'Não encontrado', `${recurso} não encontrado(a).`)
}

function comContagem(tutor: Tutor): Tutor {
  return { ...tutor, quantidadeAnimais: animais.filter((a) => a.tutorId === tutor.id).length }
}

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

  http.post('*/api/usuarios', async ({ request }) => {
    const dto = (await request.json()) as { nome: string; email: string; perfil: Usuario['perfil'] }
    if (usuariosMock.some((u) => u.email === dto.email.toLowerCase())) {
      return problema(409, 'Conflito', `Já existe um usuário com o e-mail '${dto.email}'.`)
    }
    const novo: Usuario = { id: crypto.randomUUID(), nome: dto.nome, email: dto.email.toLowerCase(), perfil: dto.perfil, ativo: true }
    usuariosMock.push(novo)
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.put('*/api/usuarios/:id', async ({ params, request }) => {
    const usuario = usuariosMock.find((u) => u.id === params.id)
    if (!usuario) return naoEncontrado('Usuário')
    const dto = (await request.json()) as { nome: string; email: string; perfil: Usuario['perfil'] }
    Object.assign(usuario, { nome: dto.nome, email: dto.email.toLowerCase(), perfil: dto.perfil })
    return HttpResponse.json(usuario)
  }),

  http.patch('*/api/usuarios/:id/ativo', async ({ params, request }) => {
    const usuario = usuariosMock.find((u) => u.id === params.id)
    if (!usuario) return naoEncontrado('Usuário')
    usuario.ativo = ((await request.json()) as { ativo: boolean }).ativo
    return HttpResponse.json(usuario)
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
    return HttpResponse.json(pagina(filtrados.map(comContagem), url))
  }),

  http.get('*/api/tutores/:id', ({ params }) => {
    const tutor = tutores.find((t) => t.id === params.id)
    return tutor ? HttpResponse.json(comContagem(tutor)) : naoEncontrado('Tutor')
  }),

  http.get('*/api/tutores/:id/animais', ({ params, request }) =>
    HttpResponse.json(
      pagina(
        animais.filter((a) => a.tutorId === params.id),
        new URL(request.url),
      ),
    ),
  ),

  http.post('*/api/tutores', async ({ request }) => {
    const dto = (await request.json()) as SalvarTutor
    const cpf = dto.cpf.replace(/\D/g, '')
    if (tutores.some((t) => t.cpf === cpf)) return problema(409, 'Conflito', 'Já existe um tutor cadastrado com este CPF.')

    const novo: Tutor = {
      ...dto,
      id: crypto.randomUUID(),
      cpf,
      email: dto.email ?? null,
      endereco: dto.endereco ?? null,
      usuarioId: dto.usuarioId ?? null,
      quantidadeAnimais: 0,
    }
    tutores.push(novo)
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.put('*/api/tutores/:id', async ({ params, request }) => {
    const indice = tutores.findIndex((t) => t.id === params.id)
    if (indice < 0) return naoEncontrado('Tutor')

    const dto = (await request.json()) as SalvarTutor
    const cpf = dto.cpf.replace(/\D/g, '')
    if (tutores.some((t) => t.cpf === cpf && t.id !== params.id)) {
      return problema(409, 'Conflito', 'Já existe um tutor cadastrado com este CPF.')
    }

    tutores[indice] = {
      ...tutores[indice],
      ...dto,
      cpf,
      email: dto.email ?? null,
      endereco: dto.endereco ?? null,
      usuarioId: dto.usuarioId ?? null,
    }
    animais.filter((a) => a.tutorId === params.id).forEach((a) => (a.tutorNome = dto.nome))
    return HttpResponse.json(comContagem(tutores[indice]))
  }),

  http.delete('*/api/tutores/:id', ({ params }) => {
    const indice = tutores.findIndex((t) => t.id === params.id)
    if (indice < 0) return naoEncontrado('Tutor')
    if (animais.some((a) => a.tutorId === params.id)) {
      return problema(409, 'Conflito', 'Não é possível excluir um tutor que possui animais cadastrados.')
    }
    tutores.splice(indice, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/animais', ({ request }) => {
    const url = new URL(request.url)
    const busca = url.searchParams.get('busca')?.toLowerCase()
    const tutorId = url.searchParams.get('tutorId')
    const filtrados = animais.filter(
      (a) =>
        (!tutorId || a.tutorId === tutorId) &&
        (!busca || a.nome.toLowerCase().includes(busca) || a.tutorNome.toLowerCase().includes(busca)),
    )
    return HttpResponse.json(pagina(filtrados, url))
  }),

  http.get('*/api/animais/:id', ({ params }) => {
    const animal = animais.find((a) => a.id === params.id)
    return animal ? HttpResponse.json(animal) : naoEncontrado('Animal')
  }),

  http.post('*/api/animais', async ({ request }) => {
    const dto = (await request.json()) as SalvarAnimal
    const tutor = tutores.find((t) => t.id === dto.tutorId)
    if (!tutor) return problema(400, 'Regra de negócio violada', 'Tutor informado não existe.')

    const novo: Animal = {
      ...dto,
      id: crypto.randomUUID(),
      raca: dto.raca ?? null,
      dataNascimento: dto.dataNascimento ?? null,
      peso: dto.peso ?? null,
      observacoes: dto.observacoes ?? null,
      tutorNome: tutor.nome,
    }
    animais.push(novo)
    return HttpResponse.json(novo, { status: 201 })
  }),

  http.put('*/api/animais/:id', async ({ params, request }) => {
    const indice = animais.findIndex((a) => a.id === params.id)
    if (indice < 0) return naoEncontrado('Animal')

    const dto = (await request.json()) as SalvarAnimal
    animais[indice] = {
      ...animais[indice],
      ...dto,
      raca: dto.raca ?? null,
      dataNascimento: dto.dataNascimento ?? null,
      peso: dto.peso ?? null,
      observacoes: dto.observacoes ?? null,
    }
    return HttpResponse.json(animais[indice])
  }),

  http.delete('*/api/animais/:id', ({ params }) => {
    const indice = animais.findIndex((a) => a.id === params.id)
    if (indice < 0) return naoEncontrado('Animal')
    animais.splice(indice, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/me/animais', ({ request }) => {
    const usuario = usuarioDoToken(request)
    const tutor = tutores.find((t) => t.usuarioId === usuario?.id)
    if (!tutor) return problema(404, 'Não encontrado', 'Seu usuário ainda não está vinculado a um cadastro de tutor.')
    return HttpResponse.json(pagina(animais.filter((a) => a.tutorId === tutor.id), new URL(request.url)))
  }),

  http.get('*/api/consultas/horarios-disponiveis', ({ request }) => {
    const url = new URL(request.url)
    const vet = url.searchParams.get('veterinarioId')
    const data = url.searchParams.get('data')!
    const servico = servicos.find((s) => s.id === url.searchParams.get('servicoId'))
    if (!servico) return naoEncontrado('Serviço')

    const livres = []
    for (let minutos = 8 * 60; minutos + servico.duracaoMinutos <= 18 * 60; minutos += servico.duracaoMinutos) {
      const hh = String(Math.floor(minutos / 60)).padStart(2, '0')
      const mm = String(minutos % 60).padStart(2, '0')
      const inicio = `${data}T${hh}:${mm}:00`
      const ocupado = consultas.some((c) => c.veterinarioId === vet && c.status === 'Agendada' && c.dataHora === inicio)
      if (!ocupado) livres.push({ inicio, fim: inicio })
    }
    return HttpResponse.json(livres)
  }),

  http.get('*/api/me/consultas', ({ request }) => {
    const usuario = usuarioDoToken(request)
    const tutor = tutores.find((t) => t.usuarioId === usuario?.id)
    if (!tutor) return problema(404, 'Não encontrado', 'Seu usuário ainda não está vinculado a um cadastro de tutor.')
    return HttpResponse.json(pagina(consultas.filter((c) => c.tutorId === tutor.id), new URL(request.url)))
  }),

  http.patch('*/api/consultas/:id/cancelar', async ({ params, request }) => {
    const consulta = consultas.find((c) => c.id === params.id)
    if (!consulta) return naoEncontrado('Consulta')
    if (consulta.status !== 'Agendada') {
      return problema(400, 'Regra de negócio violada', `Só é possível cancelar consultas agendadas (status atual: ${consulta.status}).`)
    }
    consulta.status = 'Cancelada'
    consulta.motivoCancelamento = ((await request.json()) as { motivo: string }).motivo
    return HttpResponse.json(consulta)
  }),

  http.get('*/api/consultas', ({ request }) => {
    const url = new URL(request.url)
    const data = url.searchParams.get('data')
    const status = url.searchParams.get('status')
    let vet = url.searchParams.get('veterinarioId')
    const usuario = usuarioDoToken(request)
    if (usuario?.perfil === 'Veterinario') vet = veterinarios.find((v) => v.usuarioId === usuario.id)?.id ?? null

    const lista = consultas
      .filter(
        (c) =>
          (!data || c.dataHora.startsWith(data)) &&
          (!vet || c.veterinarioId === vet) &&
          (!status || c.status === status),
      )
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
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
