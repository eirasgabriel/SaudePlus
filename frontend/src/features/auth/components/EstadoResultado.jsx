import { IconeAlerta, IconeCheck, IconeEnvelopeEnviado } from './Icones.jsx'

const SELOS = {
  sucesso: IconeCheck,
  info: IconeEnvelopeEnviado,
  erro: IconeAlerta,
}

/**
 * Tela de desfecho: selo redondo, título, explicação e as ações seguintes.
 *
 * Substitui o formulário quando a operação termina — conta criada, e-mail
 * enviado, senha alterada, link inválido.
 *
 * @param {object} props
 * @param {'sucesso'|'info'|'erro'} [props.tipo]
 * @param {string} props.titulo
 * @param {React.ReactNode} props.descricao
 * @param {React.ReactNode} [props.children]  botões e links de ação
 */
export default function EstadoResultado({ tipo = 'sucesso', titulo, descricao, children }) {
  const Selo = SELOS[tipo] ?? IconeCheck

  return (
    <section className={`sp-resultado sp-resultado--${tipo}`} role="status" aria-live="polite">
      <span className="sp-resultado__selo">
        <Selo />
      </span>

      <h1 className="sp-resultado__titulo">{titulo}</h1>
      <p className="sp-resultado__texto">{descricao}</p>

      {children}
    </section>
  )
}
