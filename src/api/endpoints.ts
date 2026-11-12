import { api } from './client'
import type {
  AgendarConsulta,
  Animal,
  AtualizarUsuario,
  Configuracao,
  Consulta,
  CriarUsuario,
  FiltroConsultas,
  HorarioDisponivel,
  LoginResposta,
  PaginaResultado,
  ParametrosPagina,
  SalvarAnimal,
  SalvarTutor,
  Servico,
  Tutor,
  Usuario,
  Veterinario,
} from './types'

export const auth = {
  login: (email: string, senha: string) =>
    api<LoginResposta>('/api/auth/login', { method: 'POST', body: { email, senha }, publica: true }),
  me: () => api<Usuario>('/api/auth/me'),
}

export const usuarios = {
  listar: (p: ParametrosPagina & { busca?: string; perfil?: string } = {}) =>
    api<PaginaResultado<Usuario>>('/api/usuarios', { query: { ...p } }),
  obter: (id: string) => api<Usuario>(`/api/usuarios/${id}`),
  criar: (dados: CriarUsuario) => api<Usuario>('/api/usuarios', { method: 'POST', body: dados }),
  atualizar: (id: string, dados: AtualizarUsuario) =>
    api<Usuario>(`/api/usuarios/${id}`, { method: 'PUT', body: dados }),
  definirAtivo: (id: string, ativo: boolean) =>
    api<Usuario>(`/api/usuarios/${id}/ativo`, { method: 'PATCH', body: { ativo } }),
}

export const tutores = {
  listar: (p: ParametrosPagina & { busca?: string } = {}) =>
    api<PaginaResultado<Tutor>>('/api/tutores', { query: { ...p } }),
  obter: (id: string) => api<Tutor>(`/api/tutores/${id}`),
  animais: (id: string, p: ParametrosPagina = {}) =>
    api<PaginaResultado<Animal>>(`/api/tutores/${id}/animais`, { query: { ...p } }),
  criar: (dados: SalvarTutor) => api<Tutor>('/api/tutores', { method: 'POST', body: dados }),
  atualizar: (id: string, dados: SalvarTutor) =>
    api<Tutor>(`/api/tutores/${id}`, { method: 'PUT', body: dados }),
  excluir: (id: string) => api<void>(`/api/tutores/${id}`, { method: 'DELETE' }),
}

export const animais = {
  listar: (p: ParametrosPagina & { busca?: string; tutorId?: string } = {}) =>
    api<PaginaResultado<Animal>>('/api/animais', { query: { ...p } }),
  obter: (id: string) => api<Animal>(`/api/animais/${id}`),
  criar: (dados: SalvarAnimal) => api<Animal>('/api/animais', { method: 'POST', body: dados }),
  atualizar: (id: string, dados: SalvarAnimal) =>
    api<Animal>(`/api/animais/${id}`, { method: 'PUT', body: dados }),
  excluir: (id: string) => api<void>(`/api/animais/${id}`, { method: 'DELETE' }),
}

export const catalogo = {
  veterinarios: (somenteAtivos = true) =>
    api<Veterinario[]>('/api/veterinarios', { query: { somenteAtivos } }),
  servicos: (somenteAtivos = true) => api<Servico[]>('/api/servicos', { query: { somenteAtivos } }),
  configuracao: () => api<Configuracao>('/api/configuracao'),
}

export const consultas = {
  listar: (filtro: FiltroConsultas = {}) =>
    api<PaginaResultado<Consulta>>('/api/consultas', { query: { ...filtro } }),
  obter: (id: string) => api<Consulta>(`/api/consultas/${id}`),
  horariosDisponiveis: (veterinarioId: string, data: string, servicoId: string) =>
    api<HorarioDisponivel[]>('/api/consultas/horarios-disponiveis', {
      query: { veterinarioId, data, servicoId },
    }),
  agendar: (dados: AgendarConsulta) => api<Consulta>('/api/consultas', { method: 'POST', body: dados }),
  cancelar: (id: string, motivo: string) =>
    api<Consulta>(`/api/consultas/${id}/cancelar`, { method: 'PATCH', body: { motivo } }),
}

export const minhaArea = {
  animais: (p: ParametrosPagina = {}) => api<PaginaResultado<Animal>>('/api/me/animais', { query: { ...p } }),
  consultas: (p: ParametrosPagina = {}) =>
    api<PaginaResultado<Consulta>>('/api/me/consultas', { query: { ...p } }),
}

export const saude = {
  verificar: () => api<{ status: string; checks: Record<string, string> }>('/health', { publica: true }),
}
