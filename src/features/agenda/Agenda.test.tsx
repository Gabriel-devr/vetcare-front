import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { consultas } from '../../api/endpoints'
import { hojeISO } from '../../lib/datas'
import { server } from '../../mocks/server'
import { logarComo, renderApp } from '../../test/renderApp'

async function agendarPelaTela(data: string) {
  const usuario = userEvent.setup()
  const form = screen.getByRole('form', { name: 'Novo agendamento' })

  await within(form).findByRole('option', { name: /Thor/ })
  await usuario.selectOptions(within(form).getByLabelText('Animal'), 'a1')
  await within(form).findByRole('option', { name: /Consulta clínica/ })
  await usuario.selectOptions(within(form).getByLabelText('Serviço'), 's1')
  await usuario.selectOptions(within(form).getByLabelText('Veterinário'), 'v1')
  fireEvent.change(within(form).getByLabelText('Data'), { target: { value: data } })
  await within(form).findByRole('option', { name: '10:00' })
  await usuario.selectOptions(within(form).getByLabelText('Horário livre'), '10:00')
  await usuario.click(within(form).getByRole('button', { name: 'Agendar consulta' }))
}

describe('agenda da recepção', () => {
  it('agenda uma consulta e mostra na agenda do dia', async () => {
    logarComo('recepcao@vetcare.local')
    renderApp('/agenda')

    await agendarPelaTela('2030-01-08')

    expect(await screen.findByRole('status')).toHaveTextContent('Consulta agendada para 08/01/2030 10:00.')
    const filtros = screen.getByRole('group', { name: 'Filtros' })
    await waitFor(() => expect(within(filtros).getByLabelText('Data')).toHaveValue('2030-01-08'))
    expect(await screen.findByRole('cell', { name: 'Thor' })).toBeInTheDocument()
  })

  it('mostra a mensagem quando o horário já está ocupado', async () => {
    server.use(
      http.post('*/api/consultas', () =>
        HttpResponse.json(
          { status: 409, title: 'Conflito', detail: 'O veterinário já possui uma consulta nesse horário.' },
          { status: 409 },
        ),
      ),
    )
    logarComo('recepcao@vetcare.local')
    renderApp('/agenda')

    await agendarPelaTela('2030-03-12')

    expect(await screen.findByRole('alert')).toHaveTextContent('O veterinário já possui uma consulta nesse horário.')
  })

  it('cancela uma consulta informando o motivo', async () => {
    await consultas.agendar({ animalId: 'a2', veterinarioId: 'v2', servicoId: 's1', dataHora: '2030-02-05T09:00:00' })
    logarComo('recepcao@vetcare.local')
    renderApp('/agenda')
    const usuario = userEvent.setup()

    const filtros = screen.getByRole('group', { name: 'Filtros' })
    fireEvent.change(within(filtros).getByLabelText('Data'), { target: { value: '2030-02-05' } })
    await usuario.click(await screen.findByRole('button', { name: 'Cancelar' }))

    const dialogo = screen.getByRole('dialog')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Cancelar consulta' }))
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('Informe o motivo')

    await usuario.type(within(dialogo).getByLabelText('Motivo do cancelamento'), 'Tutor pediu remarcação')
    await usuario.click(within(dialogo).getByRole('button', { name: 'Cancelar consulta' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Cancelada')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
  })

  it('início mostra os contadores e as consultas de hoje', async () => {
    await consultas.agendar({ animalId: 'a3', veterinarioId: 'v1', servicoId: 's2', dataHora: `${hojeISO()}T11:00:00` })
    logarComo('recepcao@vetcare.local')
    renderApp('/inicio')

    expect(await screen.findByRole('cell', { name: 'Pipoca' })).toBeInTheDocument()
    expect(screen.getByText('Agendadas').parentElement).toHaveTextContent('1')
    expect(screen.getByText('Canceladas').parentElement).toHaveTextContent('0')
  })
})

describe('agenda do veterinário', () => {
  it('mostra só as consultas do veterinário logado, sem ações', async () => {
    const hoje = hojeISO()
    await consultas.agendar({ animalId: 'a1', veterinarioId: 'v1', servicoId: 's1', dataHora: `${hoje}T14:00:00` })
    await consultas.agendar({ animalId: 'a2', veterinarioId: 'v2', servicoId: 's1', dataHora: `${hoje}T15:00:00` })
    logarComo('ana.vet@vetcare.local')
    renderApp('/minha-agenda')

    expect(await screen.findByRole('cell', { name: 'Thor' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'Mia' })).not.toBeInTheDocument()
    expect(screen.getByText(/Somente consulta/)).toBeInTheDocument()
    expect(within(screen.getByRole('main')).queryByRole('button')).not.toBeInTheDocument()
  })
})
