import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { logarComo, renderApp } from '../../test/renderApp'

describe('usuários e serviços (admin)', () => {
  it('lista os usuários com CRMV dos veterinários', async () => {
    logarComo('admin@vetcare.local')
    renderApp('/usuarios')

    expect(await screen.findByText('Dra. Ana Souza')).toBeInTheDocument()
    expect(await screen.findByText('CRMV-BA 12345')).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByText('Administrador VetCare')).toBeInTheDocument()
  })

  it('exige senha com 8 caracteres e cria o usuário', async () => {
    logarComo('admin@vetcare.local')
    renderApp('/usuarios')
    const usuario = userEvent.setup()
    const form = await screen.findByRole('form', { name: 'Novo usuário' })

    await usuario.type(within(form).getByLabelText('Nome'), 'Bruno Carvalho')
    await usuario.type(within(form).getByLabelText('E-mail'), 'bruno@vetcare.local')
    await usuario.type(within(form).getByLabelText('Senha inicial'), '123')
    await usuario.click(within(form).getByRole('button', { name: 'Salvar usuário' }))
    expect(await within(form).findByText('A senha deve ter no mínimo 8 caracteres.')).toBeInTheDocument()

    await usuario.clear(within(form).getByLabelText('Senha inicial'))
    await usuario.type(within(form).getByLabelText('Senha inicial'), 'Senha1234')
    await usuario.click(within(form).getByRole('button', { name: 'Salvar usuário' }))

    expect(await screen.findByText('Bruno Carvalho')).toBeInTheDocument()
    expect(await within(form).findByRole('status')).toHaveTextContent('Usuário criado.')
  })

  it('desativa um usuário pela edição', async () => {
    logarComo('admin@vetcare.local')
    renderApp('/usuarios')
    const usuario = userEvent.setup()

    const linha = (await screen.findByText('Recepção VetCare')).closest('tr')!
    await usuario.click(within(linha).getByRole('button', { name: 'Editar' }))

    const form = screen.getByRole('form', { name: 'Editar usuário' })
    await usuario.click(within(form).getByLabelText('Ativo'))
    await usuario.click(within(form).getByRole('button', { name: 'Salvar usuário' }))

    await waitFor(() => expect(within(screen.getByText('Recepção VetCare').closest('tr')!).getByText('Inativo')).toBeInTheDocument())
    expect(screen.getByRole('form', { name: 'Novo usuário' })).toBeInTheDocument()
  })

  it('mostra serviços e configuração da clínica', async () => {
    logarComo('admin@vetcare.local')
    renderApp('/servicos')

    expect(await screen.findByRole('cell', { name: 'Vacinação' })).toBeInTheDocument()
    expect(await screen.findByText('Clínica Veterinária VetCare')).toBeInTheDocument()
    expect(screen.getByText('08:00')).toBeInTheDocument()
  })
})
