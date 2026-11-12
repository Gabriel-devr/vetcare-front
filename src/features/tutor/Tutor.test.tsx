import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { consultas } from '../../api/endpoints'
import { hojeISO } from '../../lib/datas'
import { usuariosMock } from '../../mocks/handlers'
import { logarComo, renderApp } from '../../test/renderApp'

describe('área do tutor', () => {
  it('mostra os animais do tutor e avisa de consulta hoje', async () => {
    await consultas.agendar({ animalId: 'a1', veterinarioId: 'v1', servicoId: 's1', dataHora: `${hojeISO()}T10:00:00` })
    logarComo('maria.tutor@vetcare.local')
    renderApp('/meus-animais')

    expect(await screen.findByRole('heading', { name: 'Thor' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mia' })).toBeInTheDocument()
    expect(screen.queryByText('Pipoca')).not.toBeInTheDocument()
    expect(await screen.findByText('Consulta hoje, 10:00')).toBeInTheDocument()
  })

  it('lista as consultas do tutor', async () => {
    await consultas.agendar({ animalId: 'a2', veterinarioId: 'v2', servicoId: 's1', dataHora: '2030-04-02T09:30:00' })
    logarComo('maria.tutor@vetcare.local')
    renderApp('/minhas-consultas')

    const celula = await screen.findByRole('cell', { name: '02/04/2030 09:30' })
    expect(celula.closest('tr')).toHaveTextContent('Agendada')
    expect(screen.getByText(/fale com a recepção/)).toBeInTheDocument()
  })

  it('avisa quando o usuário ainda não está vinculado a um tutor', async () => {
    usuariosMock.push({
      id: '00000000-0000-4000-8000-0000000000aa',
      nome: 'Sem Vínculo',
      email: 'semvinculo@vetcare.local',
      perfil: 'Tutor',
      ativo: true,
    })
    logarComo('semvinculo@vetcare.local')
    renderApp('/meus-animais')

    expect(await screen.findByRole('alert')).toHaveTextContent('ainda não está vinculado')
  })
})
