import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { minhaArea } from '../../api/endpoints'
import { Paginacao } from '../../components/Paginacao'
import { StatusBadge } from '../../components/StatusBadge'
import { dataHoraBr } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'

export function MinhasConsultasPage() {
  const [pagina, setPagina] = useState(1)
  const { data, isPending, error } = useQuery({
    queryKey: ['me', 'consultas', pagina],
    queryFn: () => minhaArea.consultas({ pagina, tamanhoPagina: 10 }),
  })

  return (
    <>
      <div className="pagina-topo">
        <h1>Minhas consultas</h1>
      </div>

      <section className="cartao cartao-tabela">
        {isPending && <p className="vazio">Carregando…</p>}
        {error && (
          <div className="alerta alerta-erro" role="alert">
            {mensagemErro(error)}
          </div>
        )}
        {data && data.itens.length === 0 && <p className="vazio">Você ainda não tem consultas.</p>}
        {data && data.itens.length > 0 && (
          <>
            <div className="rolagem">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Animal</th>
                    <th>Veterinário</th>
                    <th>Tipo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itens.map((c) => (
                    <tr key={c.id}>
                      <td>{dataHoraBr(c.dataHora)}</td>
                      <td>{c.animalNome}</td>
                      <td>{c.veterinarioNome}</td>
                      <td>{c.servicoNome}</td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao pagina={data.pagina} totalPaginas={data.totalPaginas} total={data.total} aoMudar={setPagina} />
          </>
        )}
        <p className="vazio">Para cancelar ou remarcar, fale com a recepção da clínica.</p>
      </section>
    </>
  )
}
