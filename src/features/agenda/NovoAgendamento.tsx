import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { animais, catalogo, consultas } from '../../api/endpoints'
import type { Veterinario } from '../../api/types'
import { Campo, CampoSelect } from '../../components/Campo'
import { dataHoraBr, hojeISO, hora } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'
import { moeda } from '../../lib/formatar'

interface Props {
  veterinarios: Veterinario[]
  aoAgendar: (data: string) => void
}

export function NovoAgendamento({ veterinarios, aoAgendar }: Props) {
  const queryClient = useQueryClient()
  const [animalId, setAnimalId] = useState('')
  const [servicoId, setServicoId] = useState('')
  const [vetId, setVetId] = useState('')
  const [data, setData] = useState(hojeISO())
  const [horario, setHorario] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const animaisQ = useQuery({ queryKey: ['animais', 'todos'], queryFn: () => animais.listar({ tamanhoPagina: 100 }) })
  const servicosQ = useQuery({ queryKey: ['servicos'], queryFn: () => catalogo.servicos() })
  const completo = !!vetId && !!servicoId && !!data
  const horariosQ = useQuery({
    queryKey: ['horarios', vetId, data, servicoId],
    queryFn: () => consultas.horariosDisponiveis(vetId, data, servicoId),
    enabled: completo,
  })

  async function agendar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    setSalvando(true)
    try {
      await consultas.agendar({ animalId, veterinarioId: vetId, servicoId, dataHora: horario })
      await queryClient.invalidateQueries()
      setAviso(`Consulta agendada para ${dataHoraBr(horario)}.`)
      setHorario('')
      aoAgendar(data)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="cartao" aria-label="Novo agendamento" onSubmit={agendar}>
      <h2>Novo agendamento</h2>

      <div className="campos-pilha">
        <CampoSelect rotulo="Animal" value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
          <option value="">Selecione</option>
          {animaisQ.data?.itens.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome} ({a.tutorNome})
            </option>
          ))}
        </CampoSelect>

        <CampoSelect
          rotulo="Serviço"
          value={servicoId}
          onChange={(e) => {
            setServicoId(e.target.value)
            setHorario('')
          }}
        >
          <option value="">Selecione</option>
          {servicosQ.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} · {moeda(s.preco)}
            </option>
          ))}
        </CampoSelect>

        <CampoSelect
          rotulo="Veterinário"
          value={vetId}
          onChange={(e) => {
            setVetId(e.target.value)
            setHorario('')
          }}
        >
          <option value="">Selecione</option>
          {veterinarios.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome}
            </option>
          ))}
        </CampoSelect>

        <Campo
          rotulo="Data"
          type="date"
          value={data}
          onChange={(e) => {
            setData(e.target.value)
            setHorario('')
          }}
        />

        <CampoSelect
          rotulo="Horário livre"
          value={horario}
          disabled={!completo || !horariosQ.data?.length}
          onChange={(e) => setHorario(e.target.value)}
        >
          <option value="">{completo ? 'Selecione' : 'Escolha serviço, veterinário e data'}</option>
          {horariosQ.data?.map((h) => (
            <option key={h.inicio} value={h.inicio}>
              {hora(h.inicio)}
            </option>
          ))}
        </CampoSelect>
        {completo && horariosQ.data?.length === 0 && (
          <p className="texto-suave">Nenhum horário livre neste dia.</p>
        )}
      </div>

      {erro && (
        <div className="alerta alerta-erro" role="alert">
          {erro}
        </div>
      )}
      {aviso && (
        <div className="alerta alerta-sucesso" role="status">
          {aviso}
        </div>
      )}

      <button
        type="submit"
        className="botao botao-primario botao-bloco"
        disabled={salvando || !animalId || !horario}
      >
        Agendar consulta
      </button>
    </form>
  )
}
