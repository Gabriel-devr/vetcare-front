import type { UseFormReturn } from 'react-hook-form'
import { Campo } from '../../components/Campo'
import { mascararCpf, mascararTelefone } from '../../lib/formatar'
import type { TutorDados } from './tutorForm'

export function TutorCampos({ form }: { form: UseFormReturn<TutorDados> }) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form

  return (
    <>
      <div className="grade">
        <Campo rotulo="Nome" erro={errors.nome?.message} {...register('nome')} />
        <Campo
          rotulo="CPF"
          inputMode="numeric"
          erro={errors.cpf?.message}
          {...register('cpf', { onChange: (e) => setValue('cpf', mascararCpf(e.target.value)) })}
        />
        <Campo
          rotulo="Telefone"
          inputMode="tel"
          erro={errors.telefone?.message}
          {...register('telefone', { onChange: (e) => setValue('telefone', mascararTelefone(e.target.value)) })}
        />
        <Campo rotulo="E-mail" type="email" erro={errors.email?.message} {...register('email')} />
        <Campo rotulo="Endereço" largo erro={errors.endereco?.message} {...register('endereco')} />
      </div>
      <label className="check">
        <input type="checkbox" {...register('aceitaEmails')} />
        Aceita receber e-mails de confirmação e lembretes
      </label>
    </>
  )
}
