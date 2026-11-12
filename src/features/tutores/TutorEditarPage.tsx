import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { animais, tutores } from '../../api/endpoints'
import type { Animal, Tutor } from '../../api/types'
import { mensagemErro } from '../../lib/erros'
import { dataBr } from '../../lib/datas'
import { rotuloSexo } from './animalForm'
import { TutorCampos } from './TutorCampos'
import { tutorEsquema, tutorParaApi, tutorParaForm, type TutorDados } from './tutorForm'

export function TutorEditarPage() {
  const { id = '' } = useParams()
  const { data: tutor, isPending, error } = useQuery({ queryKey: ['tutor', id], queryFn: () => tutores.obter(id) })

  if (isPending) return <p className="texto-suave">Carregando…</p>
  if (error || !tutor) {
    return (
      <>
        <Link to="/tutores" className="voltar">
          ← Tutores e animais
        </Link>
        <div className="alerta alerta-erro" role="alert">
          {mensagemErro(error)}
        </div>
      </>
    )
  }

  return <TutorEditarFormulario tutor={tutor} />
}

function TutorEditarFormulario({ tutor }: { tutor: Tutor }) {
  const navegar = useNavigate()
  const queryClient = useQueryClient()
  const [erro, setErro] = useState<string | null>(null)

  const form = useForm<TutorDados>({ resolver: zodResolver(tutorEsquema), defaultValues: tutorParaForm(tutor) })
  const { data: lista } = useQuery({
    queryKey: ['animais', 'tutor', tutor.id],
    queryFn: () => tutores.animais(tutor.id, { tamanhoPagina: 100 }),
  })

  const salvar = form.handleSubmit(async (dados) => {
    setErro(null)
    try {
      await tutores.atualizar(tutor.id, tutorParaApi(dados, tutor.usuarioId))
      await queryClient.invalidateQueries()
      navegar('/tutores')
    } catch (e) {
      setErro(mensagemErro(e))
    }
  })

  async function excluirTutor() {
    if (!window.confirm(`Excluir o tutor ${tutor.nome}?`)) return
    setErro(null)
    try {
      await tutores.excluir(tutor.id)
      await queryClient.invalidateQueries()
      navegar('/tutores')
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }

  async function excluirAnimal(animal: Animal) {
    if (!window.confirm(`Excluir o animal ${animal.nome}?`)) return
    setErro(null)
    try {
      await animais.excluir(animal.id)
      await queryClient.invalidateQueries()
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }

  return (
    <>
      <Link to="/tutores" className="voltar">
        ← Tutores e animais
      </Link>
      <div className="pagina-topo">
        <h1>{tutor.nome}</h1>
      </div>

      {erro && (
        <div className="alerta alerta-erro" role="alert">
          {erro}
        </div>
      )}

      <form onSubmit={salvar} noValidate>
        <section className="cartao">
          <h2>Tutor</h2>
          <TutorCampos form={form} />
        </section>
        <div className="rodape-form">
          <button type="button" className="botao botao-perigo" onClick={excluirTutor}>
            Excluir tutor
          </button>
          <Link to="/tutores" className="botao botao-secundario">
            Cancelar
          </Link>
          <button type="submit" className="botao botao-primario" disabled={form.formState.isSubmitting}>
            Salvar
          </button>
        </div>
      </form>

      <section className="cartao cartao-tabela" style={{ marginTop: 'var(--espaco-5)' }}>
        <div className="pagina-topo" style={{ padding: 'var(--espaco-4) var(--espaco-5)', marginBottom: 0 }}>
          <h2 style={{ marginBottom: 0 }}>Animais</h2>
          <Link to={`/tutores/${tutor.id}/animais/novo`} className="botao botao-primario botao-pequeno">
            Novo animal
          </Link>
        </div>
        {lista && lista.itens.length === 0 && <p className="vazio">Este tutor ainda não tem animais.</p>}
        {lista && lista.itens.length > 0 && (
          <div className="rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Espécie</th>
                  <th>Raça</th>
                  <th>Sexo</th>
                  <th>Nascimento</th>
                  <th>Peso</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lista.itens.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.nome}</strong>
                    </td>
                    <td>{a.especie}</td>
                    <td>{a.raca ?? '—'}</td>
                    <td>{rotuloSexo(a.sexo)}</td>
                    <td>{a.dataNascimento ? dataBr(a.dataNascimento) : '—'}</td>
                    <td>{a.peso === null ? '—' : `${String(a.peso).replace('.', ',')} kg`}</td>
                    <td>
                      <div className="acoes">
                        <Link
                          to={`/tutores/${tutor.id}/animais/${a.id}`}
                          className="botao botao-secundario botao-pequeno"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="botao botao-perigo botao-pequeno"
                          onClick={() => excluirAnimal(a)}
                        >
                          Excluir
                        </button>
                      </div>
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
