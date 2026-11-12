import { z } from 'zod'
import type { SalvarTutor, Tutor } from '../../api/types'
import { mascararCpf, validarCpf } from '../../lib/formatar'

export const tutorEsquema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome.'),
  cpf: z.string().refine(validarCpf, 'CPF inválido.'),
  telefone: z.string().refine((v) => v.replace(/\D/g, '').length >= 10, 'Informe um telefone válido.'),
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Informe um e-mail válido.'),
  endereco: z.string(),
  aceitaEmails: z.boolean(),
})

export type TutorDados = z.infer<typeof tutorEsquema>

export const tutorVazio: TutorDados = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  endereco: '',
  aceitaEmails: true,
}

export function tutorParaApi(dados: TutorDados, usuarioId: string | null = null): SalvarTutor {
  return {
    nome: dados.nome.trim(),
    cpf: dados.cpf.replace(/\D/g, ''),
    telefone: dados.telefone,
    email: dados.email.trim() || null,
    endereco: dados.endereco.trim() || null,
    aceitaEmails: dados.aceitaEmails,
    usuarioId,
  }
}

export function tutorParaForm(tutor: Tutor): TutorDados {
  return {
    nome: tutor.nome,
    cpf: mascararCpf(tutor.cpf),
    telefone: tutor.telefone,
    email: tutor.email ?? '',
    endereco: tutor.endereco ?? '',
    aceitaEmails: tutor.aceitaEmails,
  }
}
