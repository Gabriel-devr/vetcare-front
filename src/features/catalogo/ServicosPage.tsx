import { useQuery } from '@tanstack/react-query'
import { catalogo } from '../../api/endpoints'
import { horaCurta } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'
import { moeda } from '../../lib/formatar'

export function ServicosPage() {
  const servicos = useQuery({ queryKey: ['servicos', 'todos'], queryFn: () => catalogo.servicos(false) })
  const config = useQuery({ queryKey: ['configuracao'], queryFn: () => catalogo.configuracao() })

  return (
    <>
      <div className="pagina-topo">
        <div>
          <h1>Serviços e configurações</h1>
          <p className="texto-suave">Somente consulta nesta versão.</p>
        </div>
      </div>

      <section className="cartao cartao-tabela">
        <h2 style={{ padding: 'var(--espaco-4) var(--espaco-5) 0' }}>Serviços</h2>
        {servicos.isPending && <p className="vazio">Carregando…</p>}
        {servicos.error && (
          <div className="alerta alerta-erro" role="alert">
            {mensagemErro(servicos.error)}
          </div>
        )}
        {servicos.data && (
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Preço</th>
                  <th>Duração</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {servicos.data.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nome}</td>
                    <td>{moeda(s.preco)}</td>
                    <td>{s.duracaoMinutos} min</td>
                    <td>
                      <span className={s.ativo ? 'selo selo-sucesso' : 'selo selo-neutro'}>
                        {s.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="cartao">
        <h2>Configurações da clínica</h2>
        {config.error && (
          <div className="alerta alerta-erro" role="alert">
            {mensagemErro(config.error)}
          </div>
        )}
        {config.data && (
          <dl className="lista-dados">
            <div>
              <dt>Nome da clínica</dt>
              <dd>{config.data.nomeClinica}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{config.data.telefone ?? '—'}</dd>
            </div>
            <div>
              <dt>Abre às</dt>
              <dd>{horaCurta(config.data.horarioAbertura)}</dd>
            </div>
            <div>
              <dt>Fecha às</dt>
              <dd>{horaCurta(config.data.horarioFechamento)}</dd>
            </div>
            <div>
              <dt>Lembrete de vacina (dias antes)</dt>
              <dd>{config.data.diasAntecedenciaLembreteVacina}</dd>
            </div>
            <div>
              <dt>E-mail de envio</dt>
              <dd>{config.data.emailEnvio ?? '—'}</dd>
            </div>
          </dl>
        )}
      </section>
    </>
  )
}
