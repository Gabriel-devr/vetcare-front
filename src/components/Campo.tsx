import { useId, type ComponentProps } from 'react'

interface Base {
  rotulo: string
  erro?: string
  largo?: boolean
}

export function Campo({ rotulo, erro, largo, ...props }: Base & ComponentProps<'input'>) {
  const id = useId()
  return (
    <div className={largo ? 'campo largo' : 'campo'}>
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} aria-invalid={!!erro} {...props} />
      {erro && <span className="campo-erro">{erro}</span>}
    </div>
  )
}

export function CampoSelect({ rotulo, erro, largo, children, ...props }: Base & ComponentProps<'select'>) {
  const id = useId()
  return (
    <div className={largo ? 'campo largo' : 'campo'}>
      <label htmlFor={id}>{rotulo}</label>
      <select id={id} aria-invalid={!!erro} {...props}>
        {children}
      </select>
      {erro && <span className="campo-erro">{erro}</span>}
    </div>
  )
}

export function CampoTexto({ rotulo, erro, largo, ...props }: Base & ComponentProps<'textarea'>) {
  const id = useId()
  return (
    <div className={largo ? 'campo largo' : 'campo'}>
      <label htmlFor={id}>{rotulo}</label>
      <textarea id={id} aria-invalid={!!erro} {...props} />
      {erro && <span className="campo-erro">{erro}</span>}
    </div>
  )
}
