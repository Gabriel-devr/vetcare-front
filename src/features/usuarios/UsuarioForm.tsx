import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { usuarios } from '../../api/endpoints'
import type { Perfil, Usuario } from '../../api/types'
import { rotuloPerfil } from '../../auth/perfis'
import { Campo, CampoSelect } from '../../components/Campo'
import { mensagemErro } from '../../lib/erros'

const PERFIS: Perfil[] = ['Admin', 'Recepcionista', 'Veterinario', 'Tutor']

const base = z.object({
  nome: z.string().trim().min(2, 'Informe o nome.'),
  email: z.string().trim().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  perfil: z.enum(['Admin', 'Recepcionista', 'Veterinario', 'Tutor']),
  senha: z.string(),
  ativo: z.boolean(),
})

type Dados = z.infer<typeof base>

const vazio: Dados = { nome: '', email: '', perfil: 'Recepcionista', senha: '', ativo: true }

interface Props {
  usuario: Usuario | null
  aoConcluir: () => void
}

export function UsuarioForm({ usuario, aoConcluir }: Props) {
  const queryClient = useQueryClient()
  const criando = usuario === null
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const esquema = useMemo(
    () => (criando ? base.extend({ senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.') }) : base),
    [criando],
  )

  const form = useForm<Dados>({
    resolver: zodResolver(esquema),
    defaultValues: usuario
      ? { nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, senha: '', ativo: usuario.ativo }
      : vazio,
  })
  const {
    register,
    formState: { errors, isSubmitting },
  } = form

  const salvar = form.handleSubmit(async (dados) => {
    setErro(null)
    setAviso(null)
    try {
      if (usuario) {
        await usuarios.atualizar(usuario.id, { nome: dados.nome, email: dados.email, perfil: dados.perfil })
        if (dados.ativo !== usuario.ativo) await usuarios.definirAtivo(usuario.id, dados.ativo)
      } else {
        const criado = await usuarios.criar({
          nome: dados.nome,
          email: dados.email,
          senha: dados.senha,
          perfil: dados.perfil,
        })
        if (!dados.ativo) await usuarios.definirAtivo(criado.id, false)
      }
      await queryClient.invalidateQueries()
      if (usuario) {
        aoConcluir()
      } else {
        form.reset(vazio)
        setAviso('Usuário criado.')
      }
    } catch (e) {
      setErro(mensagemErro(e))
    }
  })

  return (
    <form className="cartao" aria-label={criando ? 'Novo usuário' : 'Editar usuário'} onSubmit={salvar} noValidate>
      <h2>{criando ? 'Novo usuário' : 'Editar usuário'}</h2>

      <div className="campos-pilha">
        <Campo rotulo="Nome" erro={errors.nome?.message} {...register('nome')} />
        <Campo rotulo="E-mail" type="email" erro={errors.email?.message} {...register('email')} />
        <CampoSelect rotulo="Perfil" erro={errors.perfil?.message} {...register('perfil')}>
          {PERFIS.map((p) => (
            <option key={p} value={p}>
              {rotuloPerfil(p)}
            </option>
          ))}
        </CampoSelect>
        {criando && (
          <Campo
            rotulo="Senha inicial"
            type="password"
            autoComplete="new-password"
            erro={errors.senha?.message}
            {...register('senha')}
          />
        )}
        <label className="check">
          <input type="checkbox" {...register('ativo')} />
          Ativo
        </label>
      </div>

      {erro && (
        <div className="alerta alerta-erro" role="alert">
          {erro}
        </div>
      )}
      {aviso && (
        <div className="alerta alerta-sucesso" role="status">
          {aviso}
        </div>
      )}

      <button type="submit" className="botao botao-primario botao-bloco" disabled={isSubmitting}>
        Salvar usuário
      </button>
      {!criando && (
        <button type="button" className="botao botao-secundario botao-bloco" onClick={aoConcluir}>
          Cancelar edição
        </button>
      )}
    </form>
  )
}
