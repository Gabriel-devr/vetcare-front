import { useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { consultas } from '../../api/endpoints'
import type { Consulta } from '../../api/types'
import { CampoTexto } from '../../components/Campo'
import { Modal } from '../../components/Modal'
import { dataHoraBr } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'

interface Props {
  consulta: Consulta
  aoFechar: () => void
}

export function CancelarModal({ consulta, aoFechar }: Props) {
  const queryClient = useQueryClient()
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function cancelar(e: FormEvent) {
    e.preventDefault()
    if (motivo.trim().length < 3) {
      setErro('Informe o motivo (mínimo 3 caracteres).')
      return
    }
    setErro(null)
    setSalvando(true)
    try {
      await consultas.cancelar(consulta.id, motivo.trim())
      await queryClient.invalidateQueries()
      aoFechar()
    } catch (e) {
      setErro(mensagemErro(e))
      setSalvando(false)
    }
  }

  return (
    <Modal titulo="Cancelar consulta" aoFechar={aoFechar}>
      <p className="texto-suave">
        {consulta.animalNome} · {dataHoraBr(consulta.dataHora)} · {consulta.veterinarioNome}
      </p>
      <form onSubmit={cancelar} noValidate>
        <CampoTexto rotulo="Motivo do cancelamento" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        {erro && (
          <div className="alerta alerta-erro" role="alert">
            {erro}
          </div>
        )}
        <div className="rodape-form">
          <button type="button" className="botao botao-secundario" onClick={aoFechar}>
            Voltar
          </button>
          <button type="submit" className="botao botao-perigo" disabled={salvando}>
            Cancelar consulta
          </button>
        </div>
      </form>
    </Modal>
  )
}
