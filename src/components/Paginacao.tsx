interface Props {
  pagina: number
  totalPaginas: number
  total: number
  aoMudar: (pagina: number) => void
}

export function Paginacao({ pagina, totalPaginas, total, aoMudar }: Props) {
  return (
    <div className="paginacao">
      <span>
        {total} {total === 1 ? 'resultado' : 'resultados'}
      </span>
      <div className="acoes">
        <button
          type="button"
          className="botao botao-secundario botao-pequeno"
          disabled={pagina <= 1}
          onClick={() => aoMudar(pagina - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="botao botao-secundario botao-pequeno"
          disabled={pagina >= totalPaginas}
          onClick={() => aoMudar(pagina + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
