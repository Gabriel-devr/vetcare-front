import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SENHA_MOCK } from '../../mocks/handlers'
import { logarComo, renderApp } from '../../test/renderApp'

async function entrar(email: string, senha: string) {
  const usuario = userEvent.setup()
  await usuario.type(screen.getByLabelText('E-mail'), email)
  await usuario.type(screen.getByLabelText('Senha'), senha)
  await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('login e rotas por perfil', () => {
  it('sem sessão, qualquer rota leva ao login', async () => {
    renderApp('/agenda')
    expect(await screen.findByRole('heading', { name: 'Entrar no VetCare' })).toBeInTheDocument()
  })

  it('mostra erro quando a senha está errada', async () => {
    renderApp('/login')
    await entrar('recepcao@vetcare.local', 'errada')
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
  })

  it('valida os campos antes de chamar a API', async () => {
    renderApp('/login')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
  })

  it('recepcionista entra e vê o menu da recepção', async () => {
    renderApp('/login')
    await entrar('recepcao@vetcare.local', SENHA_MOCK)

    expect(await screen.findByRole('heading', { name: 'Consultas de hoje' })).toBeInTheDocument()
    expect(screen.getByText('Recepção VetCare')).toBeInTheDocument()
    const menu = screen.getByRole('navigation', { name: 'Principal' })
    expect(menu).toHaveTextContent('Agenda')
    expect(menu).toHaveTextContent('Tutores e animais')
    expect(menu).not.toHaveTextContent('Usuários')
  })

  it('veterinário cai na própria agenda e tutor não acessa rotas de admin', async () => {
    logarComo('ana.vet@vetcare.local')
    const vet = renderApp('/usuarios')
    expect(await screen.findByRole('heading', { name: 'Minha agenda' })).toBeInTheDocument()
    vet.unmount()

    logarComo('maria.tutor@vetcare.local')
    renderApp('/usuarios')
    expect(await screen.findByRole('heading', { name: 'Meus animais' })).toBeInTheDocument()
  })

  it('admin vê o menu de administração', async () => {
    logarComo('admin@vetcare.local')
    renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Usuários' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toHaveTextContent('Serviços e configurações')
  })

  it('sair volta para o login', async () => {
    logarComo('recepcao@vetcare.local')
    renderApp('/inicio')
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Sair' }))
    expect(await screen.findByRole('heading', { name: 'Entrar no VetCare' })).toBeInTheDocument()
  })
})
