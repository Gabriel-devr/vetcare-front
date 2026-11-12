
export type Perfil = 'Admin' | 'Recepcionista' | 'Veterinario' | 'Tutor'

export interface PaginaResultado<T> {
  itens: T[]
  pagina: number
  tamanhoPagina: number
  total: number
  totalPaginas: number
}

export interface ParametrosPagina {
  pagina?: number
  tamanhoPagina?: number
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  ativo: boolean
}

export interface LoginResposta {
  token: string
  expiraEm: string
  usuario: Usuario
}

export interface CriarUsuario {
  nome: string
  email: string
  senha: string
  perfil: Perfil
}

export interface AtualizarUsuario {
  nome: string
  email: string
  perfil: Perfil
}

export type Sexo = 'NaoInformado' | 'Macho' | 'Femea'

export interface Tutor {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string | null
  endereco: string | null
  aceitaEmails: boolean
  usuarioId: string | null
  quantidadeAnimais: number
}

export interface SalvarTutor {
  nome: string
  cpf: string
  telefone: string
  email?: string | null
  endereco?: string | null
  aceitaEmails: boolean
  usuarioId?: string | null
}

export interface Animal {
  id: string
  nome: string
  especie: string
  raca: string | null
  sexo: Sexo
  dataNascimento: string | null
  peso: number | null
  observacoes: string | null
  tutorId: string
  tutorNome: string
}

export interface SalvarAnimal {
  nome: string
  especie: string
  raca?: string | null
  sexo: Sexo
  dataNascimento?: string | null
  peso?: number | null
  observacoes?: string | null
  tutorId: string
}

export interface Veterinario {
  id: string
  usuarioId: string
  nome: string
  email: string
  crmv: string
  especialidade: string | null
  ativo: boolean
}

export interface Servico {
  id: string
  nome: string
  preco: number
  duracaoMinutos: number
  ativo: boolean
}

export interface Configuracao {
  nomeClinica: string
  telefone: string | null
  horarioAbertura: string
  horarioFechamento: string
  diasAntecedenciaLembreteVacina: number
  emailEnvio: string | null
}

export type StatusConsulta = 'Agendada' | 'Cancelada' | 'Realizada'

export interface Consulta {
  id: string
  dataHora: string
  dataHoraFim: string
  status: StatusConsulta
  motivoCancelamento: string | null
  animalId: string
  animalNome: string
  tutorId: string
  tutorNome: string
  veterinarioId: string
  veterinarioNome: string
  servicoId: string
  servicoNome: string
}

export interface AgendarConsulta {
  animalId: string
  veterinarioId: string
  servicoId: string
  dataHora: string
}

export interface FiltroConsultas extends ParametrosPagina {
  data?: string
  dataInicio?: string
  dataFim?: string
  veterinarioId?: string
  animalId?: string
  tutorId?: string
  status?: StatusConsulta
}

export interface HorarioDisponivel {
  inicio: string
  fim: string
}

export interface ProblemDetails {
  status?: number
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}
