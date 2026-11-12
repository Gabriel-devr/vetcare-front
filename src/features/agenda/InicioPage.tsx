import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { consultas } from '../../api/endpoints'
import { StatusBadge } from '../../components/StatusBadge'
import { dataPorExtenso, hojeISO, hora } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'

export function InicioPage() {
  const hoje = hojeISO()
  const { data, isPending, error } = useQuery({
    queryKey: ['consultas', hoje, ''],
    queryFn: () => consultas.listar({ data: hoje, tamanhoPagina: 100 }),
  })

  const itens = data?.itens ?? []
  const resumo = [
    { rotulo: 'Agendadas', valor: itens.filter((c) => c.status === 'Agendada').length },
    { rotulo: 'Realizadas', valor: itens.filter((c) => c.status === 'Realizada').length },
    { rotulo: 'Canceladas', valor: itens.filter((c) => c.status === 'Cancelada').length },
  ]

  return (
    <>
      <div className="pagina-topo">
        <div>
          <h1>Consultas de hoje</h1>
          <p className="texto-suave">{dataPorExtenso(hoje)}</p>
        </div>
        <Link to="/agenda" className="botao botao-primario">
          Novo agendamento
        </Link>
      </div>

      <div className="resumo">
        {resumo.map((r) => (
          <div key={r.rotulo} className="cartao resumo-item">
            <span>{r.rotulo}</span>
            <strong>{r.valor}</strong>
          </div>
        ))}
      </div>

      <section className="cartao cartao-tabela">
        {isPending && <p className="vazio">Carregando…</p>}
        {error && (
          <div className="alerta alerta-erro" role="alert">
            {mensagemErro(error)}
          </div>
        )}
        {data && itens.length === 0 && <p className="vazio">Nenhuma consulta para hoje.</p>}
        {itens.length > 0 && (
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Animal</th>
                  <th>Tutor</th>
                  <th>Veterinário</th>
                  <th>Tipo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((c) => (
                  <tr key={c.id}>
                    <td>{hora(c.dataHora)}</td>
                    <td>{c.animalNome}</td>
                    <td>{c.tutorNome}</td>
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
        )}
      </section>
    </>
  )
}
