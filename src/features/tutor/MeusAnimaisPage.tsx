import { useQuery } from '@tanstack/react-query'
import { minhaArea } from '../../api/endpoints'
import { hojeISO, hora, idade } from '../../lib/datas'
import { mensagemErro } from '../../lib/erros'
import { rotuloSexo } from '../tutores/animalForm'

export function MeusAnimaisPage() {
  const animais = useQuery({ queryKey: ['me', 'animais'], queryFn: () => minhaArea.animais({ tamanhoPagina: 100 }) })
  const agenda = useQuery({ queryKey: ['me', 'consultas'], queryFn: () => minhaArea.consultas({ tamanhoPagina: 100 }) })

  const hoje = hojeISO()
  const consultasHoje = new Map(
    agenda.data?.itens
      .filter((c) => c.status === 'Agendada' && c.dataHora.startsWith(hoje))
      .map((c) => [c.animalId, hora(c.dataHora)]),
  )

  return (
    <>
      <div className="pagina-topo">
        <h1>Meus animais</h1>
      </div>

      {animais.isPending && <p className="texto-suave">Carregando…</p>}
      {animais.error && (
        <div className="alerta alerta-erro" role="alert">
          {mensagemErro(animais.error)}
        </div>
      )}
      {animais.data && animais.data.itens.length === 0 && <p className="texto-suave">Nenhum animal cadastrado.</p>}

      <div className="cartoes-animais">
        {animais.data?.itens.map((a) => {
          const detalhes = [
            a.especie,
            a.raca,
            rotuloSexo(a.sexo),
            a.dataNascimento ? idade(a.dataNascimento) : null,
            a.peso === null ? null : `${String(a.peso).replace('.', ',')} kg`,
          ].filter(Boolean)

          return (
            <article key={a.id} className="cartao">
              <h2>{a.nome}</h2>
              <p className="texto-suave">{detalhes.join(' · ')}</p>
              {a.observacoes && (
                <div className="alerta alerta-aviso">
                  <strong>Observações:</strong> {a.observacoes}
                </div>
              )}
              {consultasHoje.has(a.id) && (
                <div>
                  <span className="selo selo-info">Consulta hoje, {consultasHoje.get(a.id)}</span>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
