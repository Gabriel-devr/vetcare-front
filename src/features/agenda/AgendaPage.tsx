import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { catalogo, consultas } from '../../api/endpoints'
import type { Consulta } from '../../api/types'
import { Campo, CampoSelect } from '../../components/Campo'
import { StatusBadge } from '../../components/StatusBadge'
import { hojeISO, hora } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'
import { CancelarModal } from './CancelarModal'
import { NovoAgendamento } from './NovoAgendamento'

export function AgendaPage() {
  const [data, setData] = useState(hojeISO())
  const [filtroVet, setFiltroVet] = useState('')
  const [cancelando, setCancelando] = useState<Consulta | null>(null)

  const vets = useQuery({ queryKey: ['veterinarios'], queryFn: () => catalogo.veterinarios() })
  const lista = useQuery({
    queryKey: ['consultas', data, filtroVet],
    queryFn: () => consultas.listar({ data, veterinarioId: filtroVet || undefined, tamanhoPagina: 100 }),
    enabled: !!data,
  })

  return (
    <>
      <div className="pagina-topo">
        <h1>Agenda</h1>
      </div>

      <div className="layout-2">
        <section className="cartao cartao-tabela">
          <div className="busca" role="group" aria-label="Filtros">
            <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            <CampoSelect rotulo="Veterinário" value={filtroVet} onChange={(e) => setFiltroVet(e.target.value)}>
              <option value="">Todos</option>
              {vets.data?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </CampoSelect>
          </div>

          {lista.isPending && <p className="vazio">Carregando…</p>}
          {lista.error && (
            <div className="alerta alerta-erro" role="alert">
              {mensagemErro(lista.error)}
            </div>
          )}
          {lista.data && lista.data.itens.length === 0 && <p className="vazio">Nenhuma consulta neste dia.</p>}
          {lista.data && lista.data.itens.length > 0 && (
            <div className="rolagem">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Animal</th>
                    <th>Veterinário</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lista.data.itens.map((c) => (
                    <tr key={c.id}>
                      <td>{hora(c.dataHora)}</td>
                      <td>{c.animalNome}</td>
                      <td>{c.veterinarioNome}</td>
                      <td>{c.servicoNome}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        {c.status === 'Agendada' && (
                          <div className="acoes">
                            <button
                              type="button"
                              className="botao botao-perigo botao-pequeno"
                              onClick={() => setCancelando(c)}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <NovoAgendamento veterinarios={vets.data ?? []} aoAgendar={setData} />
      </div>

      {cancelando && <CancelarModal consulta={cancelando} aoFechar={() => setCancelando(null)} />}
    </>
  )
}
