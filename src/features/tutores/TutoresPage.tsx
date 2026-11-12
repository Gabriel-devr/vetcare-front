import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { tutores } from '../../api/endpoints'
import { Paginacao } from '../../components/Paginacao'
import { mascararCpf } from '../../lib/formatar'
import { mensagemErro } from '../../lib/erros'

export function TutoresPage() {
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const [pagina, setPagina] = useState(1)

  const { data, isPending, error } = useQuery({
    queryKey: ['tutores', termo, pagina],
    queryFn: () => tutores.listar({ busca: termo, pagina, tamanhoPagina: 10 }),
  })

  function buscar(e: FormEvent) {
    e.preventDefault()
    setPagina(1)
    setTermo(busca.trim())
  }

  return (
    <>
      <div className="pagina-topo">
        <h1>Tutores e animais</h1>
        <Link to="/tutores/novo" className="botao botao-primario">
          Novo cadastro
        </Link>
      </div>

      <div className="cartao cartao-tabela">
        <form className="busca" onSubmit={buscar}>
          <div className="campo">
            <label htmlFor="busca">Buscar por nome ou CPF</label>
            <input id="busca" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <button type="submit" className="botao botao-secundario">
            Buscar
          </button>
        </form>

        {isPending && <p className="vazio">Carregando…</p>}
        {error && (
          <div className="alerta alerta-erro" role="alert">
            {mensagemErro(error)}
          </div>
        )}
        {data && data.itens.length === 0 && <p className="vazio">Nenhum tutor encontrado.</p>}
        {data && data.itens.length > 0 && (
          <>
            <div className="rolagem">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Tutor</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Animais</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.itens.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.nome}</strong>
                        {t.email && <small>{t.email}</small>}
                      </td>
                      <td>{mascararCpf(t.cpf)}</td>
                      <td>{t.telefone}</td>
                      <td>{t.quantidadeAnimais}</td>
                      <td>
                        <div className="acoes">
                          <Link to={`/tutores/${t.id}`} className="botao botao-secundario botao-pequeno">
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacao pagina={data.pagina} totalPaginas={data.totalPaginas} total={data.total} aoMudar={setPagina} />
          </>
        )}
      </div>
    </>
  )
}
