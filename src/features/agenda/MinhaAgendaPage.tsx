import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { consultas } from '../../api/endpoints'
import { Campo } from '../../components/Campo'
import { StatusBadge } from '../../components/StatusBadge'
import { hojeISO, hora } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'

export function MinhaAgendaPage() {
  const [data, setData] = useState(hojeISO())
  const { data: lista, isPending, error } = useQuery({
    queryKey: ['consultas', data, 'minha'],
    queryFn: () => consultas.listar({ data, tamanhoPagina: 100 }),
    enabled: !!data,
  })

  return (
    <>
      <div className="pagina-topo">
        <div>
          <h1>Minha agenda</h1>
          <p className="texto-suave">Somente consulta. Agendar e cancelar é feito pela recepção.</p>
        </div>
      </div>

      <section className="cartao cartao-tabela">
        <div className="busca">
          <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>

        {isPending && <p className="vazio">Carregando…</p>}
        {error && (
          <div className="alerta alerta-erro" role="alert">
            {mensagemErro(error)}
          </div>
        )}
        {lista && lista.itens.length === 0 && <p className="vazio">Nenhuma consulta neste dia.</p>}
        {lista && lista.itens.length > 0 && (
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Animal</th>
                  <th>Tutor</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lista.itens.map((c) => (
                  <tr key={c.id}>
                    <td>{hora(c.dataHora)}</td>
                    <td>{c.animalNome}</td>
                    <td>{c.tutorNome}</td>
                    <td>{c.servicoNome}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
