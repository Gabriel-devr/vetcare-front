import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/useAuth'
import { paginaInicial } from '../../auth/perfis'

const esquema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

type Dados = z.infer<typeof esquema>

export function LoginPage() {
  const { usuario, entrar } = useAuth()
  const navegar = useNavigate()
  const [erro, setErro] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dados>({ resolver: zodResolver(esquema) })

  if (usuario) return <Navigate to={paginaInicial(usuario.perfil)} replace />

  async function enviar(dados: Dados) {
    setErro(null)
    try {
      const logado = await entrar(dados.email, dados.senha)
      navegar(paginaInicial(logado.perfil), { replace: true })
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível entrar. Tente novamente.')
    }
  }

  return (
    <main className="login">
      <form className="login-cartao" onSubmit={handleSubmit(enviar)} noValidate>
        <div className="login-logo" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="32" height="32" fill="#fff">
            <ellipse cx="32" cy="40" rx="11" ry="9" />
            <ellipse cx="17" cy="29" rx="5" ry="6.5" />
            <ellipse cx="27" cy="20" rx="5" ry="6.5" />
            <ellipse cx="37" cy="20" rx="5" ry="6.5" />
            <ellipse cx="47" cy="29" rx="5" ry="6.5" />
          </svg>
        </div>
        <h1>Entrar no VetCare</h1>

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="username" aria-invalid={!!errors.email} {...register('email')} />
          {errors.email && <span className="campo-erro">{errors.email.message}</span>}
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.senha}
            {...register('senha')}
          />
          {errors.senha && <span className="campo-erro">{errors.senha.message}</span>}
        </div>

        {erro && (
          <div className="alerta alerta-erro" role="alert">
            {erro}
          </div>
        )}

        <button type="submit" className="botao botao-primario botao-bloco" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
