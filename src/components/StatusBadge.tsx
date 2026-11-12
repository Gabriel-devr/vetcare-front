import type { StatusConsulta } from '../api/types'

const classes: Record<StatusConsulta, string> = {
  Agendada: 'selo selo-info',
  Realizada: 'selo selo-sucesso',
  Cancelada: 'selo selo-neutro',
}

export function StatusBadge({ status }: { status: StatusConsulta }) {
  return <span className={classes[status]}>{status}</span>
}
