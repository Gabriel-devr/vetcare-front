import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { animais } from '../../api/endpoints'
import type { Animal } from '../../api/types'
import { mensagemErro } from '../../lib/erros'
import { AnimalCampos } from './AnimalCampos'
import { animalEsquema, animalParaApi, animalParaForm, animalVazio, type AnimalDados } from './animalForm'

export function AnimalPage() {
  const { tutorId = '', animalId } = useParams()
  const { data: animal, isPending, error } = useQuery({
    queryKey: ['animal', animalId],
    queryFn: () => animais.obter(animalId!),
    enabled: !!animalId,
  })

  if (animalId && isPending) return <p className="texto-suave">Carregando…</p>
  if (animalId && (error || !animal)) {
    return (
      <>
        <Link to={`/tutores/${tutorId}`} className="voltar">
          ← Voltar
        </Link>
        <div className="alerta alerta-erro" role="alert">
          {mensagemErro(error)}
        </div>
      </>
    )
  }

  return <AnimalFormulario tutorId={tutorId} animal={animal} />
}

function AnimalFormulario({ tutorId, animal }: { tutorId: string; animal?: Animal }) {
  const navegar = useNavigate()
  const queryClient = useQueryClient()
  const [erro, setErro] = useState<string | null>(null)
  const voltar = `/tutores/${tutorId}`

  const form = useForm<AnimalDados>({
    resolver: zodResolver(animalEsquema),
    defaultValues: animal ? animalParaForm(animal) : animalVazio,
  })

  const salvar = form.handleSubmit(async (dados) => {
    setErro(null)
    try {
      const corpo = animalParaApi(dados, tutorId)
      if (animal) await animais.atualizar(animal.id, corpo)
      else await animais.criar(corpo)
      await queryClient.invalidateQueries()
      navegar(voltar)
    } catch (e) {
      setErro(mensagemErro(e))
    }
  })

  return (
    <>
      <Link to={voltar} className="voltar">
        ← Voltar ao tutor
      </Link>
      <div className="pagina-topo">
        <h1>{animal ? `Editar ${animal.nome}` : 'Novo animal'}</h1>
      </div>

      {erro && (
        <div className="alerta alerta-erro" role="alert">
          {erro}
        </div>
      )}

      <form onSubmit={salvar} noValidate>
        <section className="cartao">
          <AnimalCampos form={form} />
        </section>
        <div className="rodape-form">
          <Link to={voltar} className="botao botao-secundario">
            Cancelar
          </Link>
          <button type="submit" className="botao botao-primario" disabled={form.formState.isSubmitting}>
            Salvar
          </button>
        </div>
      </form>
    </>
  )
}
