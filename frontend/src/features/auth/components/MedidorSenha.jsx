import { avaliarForcaSenha } from '../forcaSenha.js'

const SEGMENTOS_ACESOS = { fraca: 1, media: 2, forte: 3 }

/**
 * Barra de três segmentos com o nível da senha (fraca, média, forte),
 * na largura do campo de senha logo acima. Vazia antes de digitar.
 */
export default function MedidorSenha({ senha }) {
  const forca = avaliarForcaSenha(senha)
  const acesos = forca ? SEGMENTOS_ACESOS[forca.nivel] : 0

  return (
    <div className={`sp-medidor${forca ? ` sp-medidor--${forca.nivel}` : ''}`}>
      <div className="sp-medidor__barra" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= acesos ? 'sp-medidor__seg sp-medidor__seg--aceso' : 'sp-medidor__seg'} />
        ))}
      </div>

      <p className="sp-medidor__texto" aria-live="polite">
        {forca ? forca.rotulo : ' '}
      </p>
    </div>
  )
}
