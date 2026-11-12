import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../../mocks/server'
import { logarComo, renderApp } from '../../test/renderApp'

const ID_USUARIO_MARIA = '00000000-0000-4000-8000-000000000005'

describe('tutores e animais', () => {
  it('lista os tutores e filtra pela busca', async () => {
    logarComo('recepcao@vetcare.local')
    renderApp('/tutores')
    const usuario = userEvent.setup()

    expect(await screen.findByText('Maria Oliveira')).toBeInTheDocument()
    expect(screen.getByText('Luana Ribeiro')).toBeInTheDocument()

    await usuario.type(screen.getByLabelText('Buscar por nome ou CPF'), 'Luana')
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))

    await waitFor(() => expect(screen.queryByText('Maria Oliveira')).not.toBeInTheDocument())
    expect(screen.getByText('Luana Ribeiro')).toBeInTheDocument()
  })

  it('não salva com CPF inválido', async () => {
    logarComo('recepcao@vetcare.local')
    renderApp('/tutores/novo')
    const usuario = userEvent.setup()

    await usuario.type(screen.getAllByLabelText('Nome')[0], 'Fulano')
    await usuario.type(screen.getByLabelText('CPF'), '11111111111')
    await usuario.type(screen.getByLabelText('Telefone'), '71999990000')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('CPF inválido.')).toBeInTheDocument()
  })

  it('cadastra tutor e animal e volta para a lista', async () => {
    logarComo('recepcao@vetcare.local')
    renderApp('/tutores/novo')
    const usuario = userEvent.setup()

    await usuario.type(screen.getAllByLabelText('Nome')[0], 'Fernanda Rocha')
    await usuario.type(screen.getByLabelText('CPF'), '12345678909')
    await usuario.type(screen.getByLabelText('Telefone'), '71982307745')
    await usuario.type(screen.getAllByLabelText('Nome')[1], 'Nina')
    await usuario.selectOptions(screen.getByLabelText('Espécie'), 'Gato')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Fernanda Rocha')).toBeInTheDocument()
    expect(screen.getByText('123.456.789-09')).toBeInTheDocument()
  })

  it('mostra a mensagem da API quando o CPF já existe', async () => {
    logarComo('recepcao@vetcare.local')
    renderApp('/tutores/novo')
    const usuario = userEvent.setup()

    await usuario.type(screen.getAllByLabelText('Nome')[0], 'Outra Pessoa')
    await usuario.type(screen.getByLabelText('CPF'), '52998224725')
    await usuario.type(screen.getByLabelText('Telefone'), '71982307745')
    await usuario.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe um tutor cadastrado com este CPF.')
  })

  it('ao editar, mantém o vínculo do tutor com o usuário de acesso', async () => {
    let corpo: { usuarioId?: string | null } = {}
    server.use(
      http.put('*/api/tutores/:id', async ({ request }) => {
        corpo = (await request.json()) as typeof corpo
        return HttpResponse.json({})
      }),
    )
    logarComo('recepcao@vetcare.local')
    renderApp('/tutores/t1')

    await screen.findByRole('heading', { name: 'Maria Oliveira' })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(corpo.usuarioId).toBe(ID_USUARIO_MARIA))
  })

  it('não exclui tutor que tem animais', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    logarComo('recepcao@vetcare.local')
    renderApp('/tutores/t1')

    await screen.findByRole('heading', { name: 'Maria Oliveira' })
    await userEvent.setup().click(screen.getByRole('button', { name: 'Excluir tutor' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('possui animais')
  })
})
