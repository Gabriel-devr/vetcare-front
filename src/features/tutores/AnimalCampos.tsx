import type { UseFormReturn } from 'react-hook-form'
import { Campo, CampoSelect, CampoTexto } from '../../components/Campo'
import { ESPECIES, SEXOS, type AnimalDados } from './animalForm'

export function AnimalCampos({ form }: { form: UseFormReturn<AnimalDados> }) {
  const {
    register,
    getValues,
    formState: { errors },
  } = form

  const atual = getValues('especie')
  const especies = atual && !ESPECIES.includes(atual) ? [...ESPECIES, atual] : ESPECIES

  return (
    <div className="grade">
      <Campo rotulo="Nome" erro={errors.nome?.message} {...register('nome')} />
      <CampoSelect rotulo="Espécie" erro={errors.especie?.message} {...register('especie')}>
        {especies.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </CampoSelect>
      <Campo rotulo="Raça" erro={errors.raca?.message} {...register('raca')} />
      <CampoSelect rotulo="Sexo" erro={errors.sexo?.message} {...register('sexo')}>
        {SEXOS.map((s) => (
          <option key={s.valor} value={s.valor}>
            {s.rotulo}
          </option>
        ))}
      </CampoSelect>
      <Campo rotulo="Data de nascimento" type="date" erro={errors.dataNascimento?.message} {...register('dataNascimento')} />
      <Campo rotulo="Peso (kg)" inputMode="decimal" erro={errors.peso?.message} {...register('peso')} />
      <CampoTexto
        rotulo="Observações (alergias e condições)"
        largo
        erro={errors.observacoes?.message}
        {...register('observacoes')}
      />
    </div>
  )
}
