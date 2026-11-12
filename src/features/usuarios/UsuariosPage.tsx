import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { catalogo, usuarios } from '../../api/endpoints'
import type { Usuario } from '../../api/types'
import { rotuloPerfil } from '../../auth/perfis'
import { Paginacao } from '../../components/Paginacao'
import { mensagemErro } from '../../lib/erros'
import { UsuarioForm } from './UsuarioForm'

export function UsuariosPage() {
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<Usuario | null>(null)

  const lista = useQuery({
    queryKey: ['usuarios', pagina],
    queryFn: () => usuarios.listar({ pagina, tamanhoPagina: 10 }),
  })
  const vets = useQuery({ queryKey: ['veterinarios', 'todos'], queryFn: () => catalogo.veterinarios(false) })
  const crmv = new Map(vets.data?.map((v) => [v.usuarioId, v.crmv]))

  return (
    <>
      <div className="pagina-topo">
        <h1>Usuários</h1>
      </div>

      <div className="layout-2">
        <section className="cartao cartao-tabela">
          {lista.isPending && <p className="vazio">Carregando…</p>}
          {lista.error && (
            <div className="alerta alerta-erro" role="alert">
              {mensagemErro(lista.error)}
            </div>
          )}
          {lista.data && (
            <>
              <div className="rolagem">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Perfil</th>
                      <th>CRMV</th>
                      <th>Situação</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {lista.data.itens.map((u) => (
                      <tr key={u.id}>
                        <td>
                          {u.nome}
                          <small>{u.email}</small>
                        </td>
                        <td>{rotuloPerfil(u.perfil)}</td>
                        <td>{crmv.get(u.id) ?? '—'}</td>
                        <td>
                          <span className={u.ativo ? 'selo selo-sucesso' : 'selo selo-neutro'}>
                            {u.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className="acoes">
                            <button
                              type="button"
                              className="botao botao-secundario botao-pequeno"
                              onClick={() => setEditando(u)}
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Paginacao
                pagina={lista.data.pagina}
                totalPaginas={lista.data.totalPaginas}
                total={lista.data.total}
                aoMudar={setPagina}
              />
            </>
          )}
        </section>

        <UsuarioForm key={editando?.id ?? 'novo'} usuario={editando} aoConcluir={() => setEditando(null)} />
      </div>
    </>
  )
}
