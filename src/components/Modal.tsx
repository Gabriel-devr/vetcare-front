import { useEffect, useId, type ReactNode } from 'react'

interface Props {
  titulo: string
  aoFechar: () => void
  children: ReactNode
}

export function Modal({ titulo, aoFechar, children }: Props) {
  const idTitulo = useId()

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoFechar])

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={idTitulo}>{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
