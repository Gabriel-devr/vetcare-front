import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { animais, tutores } from '../../api/endpoints'
import { mensagemErro } from '../../lib/erros'
import { AnimalCampos } from './AnimalCampos'
import { animalEsquema, animalParaApi, animalVazio, type AnimalDados } from './animalForm'
import { TutorCampos } from './TutorCampos'
import { tutorEsquema, tutorParaApi, tutorVazio, type TutorDados } from './tutorForm'

export function TutorNovoPage() {
  const navegar = useNavigate()
  const queryClient = useQueryClient()
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [tutorCriado, setTutorCriado] = useState<string | null>(null)

  const tutorForm = useForm<TutorDados>({ resolver: zodResolver(tutorEsquema), defaultValues: tutorVazio })
  const animalForm = useForm<AnimalDados>({ resolver: zodResolver(animalEsquema), defaultValues: animalVazio })

  async function salvar() {
    setErro(null)
    const comAnimal = animalForm.getValues('nome').trim() !== ''
    const tutorOk = tutorCriado !== null || (await tutorForm.trigger())
    const animalOk = comAnimal ? await animalForm.trigger() : true
    if (!tutorOk || !animalOk) return

    setSalvando(true)
    let idTutor = tutorCriado
    try {
      if (!idTutor) {
        idTutor = (await tutores.criar(tutorParaApi(tutorForm.getValues()))).id
        setTutorCriado(idTutor)
      }
      if (comAnimal) await animais.criar(animalParaApi(animalForm.getValues(), idTutor))
      await queryClient.invalidateQueries()
      navegar('/tutores')
    } catch (e) {
      setErro(idTutor ? `O tutor foi salvo, mas o animal não: ${mensagemErro(e)}` : mensagemErro(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <Link to="/tutores" className="voltar">
        ← Tutores e animais
      </Link>
      <div className="pagina-topo">
        <h1>Novo cadastro</h1>
      </div>

      {erro && (
        <div className="alerta alerta-erro" role="alert">
          {erro}
        </div>
      )}

      <section className="cartao">
        <h2>Tutor</h2>
        <TutorCampos form={tutorForm} />
      </section>

      <section className="cartao">
        <h2>Animal</h2>
        <AnimalCampos form={animalForm} />
      </section>

      <div className="rodape-form">
        <Link to="/tutores" className="botao botao-secundario">
          Cancelar
        </Link>
        <button type="button" className="botao botao-primario" disabled={salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </>
  )
}
