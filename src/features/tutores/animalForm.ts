import { z } from 'zod'
import type { Animal, SalvarAnimal, Sexo } from '../../api/types'
import { hojeISO } from '../../lib/datas'
import { lerDecimal } from '../../lib/formatar'

export const ESPECIES = ['Cachorro', 'Gato', 'Ave', 'Roedor', 'Réptil', 'Outro']

export const SEXOS: { valor: Sexo; rotulo: string }[] = [
  { valor: 'NaoInformado', rotulo: 'Não informado' },
  { valor: 'Macho', rotulo: 'Macho' },
  { valor: 'Femea', rotulo: 'Fêmea' },
]

export const rotuloSexo = (sexo: Sexo) => SEXOS.find((s) => s.valor === sexo)?.rotulo ?? ''

export const animalEsquema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.'),
  especie: z.string().min(1, 'Informe a espécie.'),
  raca: z.string(),
  sexo: z.enum(['NaoInformado', 'Macho', 'Femea']),
  dataNascimento: z.string().refine((v) => v === '' || v <= hojeISO(), 'A data não pode estar no futuro.'),
  peso: z.string().refine((v) => {
    if (v.trim() === '') return true
    const n = lerDecimal(v)
    return n !== null && n >= 0.01 && n <= 999.99
  }, 'Informe um peso válido.'),
  observacoes: z.string(),
})

export type AnimalDados = z.infer<typeof animalEsquema>

export const animalVazio: AnimalDados = {
  nome: '',
  especie: 'Cachorro',
  raca: '',
  sexo: 'NaoInformado',
  dataNascimento: '',
  peso: '',
  observacoes: '',
}

export function animalParaApi(dados: AnimalDados, tutorId: string): SalvarAnimal {
  return {
    nome: dados.nome.trim(),
    especie: dados.especie,
    raca: dados.raca.trim() || null,
    sexo: dados.sexo,
    dataNascimento: dados.dataNascimento || null,
    peso: lerDecimal(dados.peso),
    observacoes: dados.observacoes.trim() || null,
    tutorId,
  }
}

export function animalParaForm(animal: Animal): AnimalDados {
  return {
    nome: animal.nome,
    especie: animal.especie,
    raca: animal.raca ?? '',
    sexo: animal.sexo,
    dataNascimento: animal.dataNascimento ?? '',
    peso: animal.peso === null ? '' : String(animal.peso).replace('.', ','),
    observacoes: animal.observacoes ?? '',
  }
}
