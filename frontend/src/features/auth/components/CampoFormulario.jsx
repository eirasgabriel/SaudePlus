import { useId, useState } from 'react'
import { IconeOlho, IconeOlhoCortado } from './Icones.jsx'

/**
 * Campo de texto do formulario de autenticacao: icone a esquerda, borda
 * arredondada e, quando for senha, o botao de mostrar/ocultar a direita.
 *
 * @param {object} props
 * @param {React.ReactNode} props.icone      icone exibido a esquerda
 * @param {string} props.rotulo              texto do <label> (fica invisivel, o
 *                                           placeholder e quem aparece, como no layout)
 * @param {string} [props.erro]              mensagem de erro do campo
 * @param {string} [props.ajuda]             texto auxiliar abaixo do campo
 */
export default function CampoFormulario({
  icone,
  rotulo,
  tipo = 'text',
  valor,
  aoAlterar,
  placeholder,
  erro,
  ajuda,
  autoComplete,
  inputMode,
  maxLength,
  desabilitado = false,
}) {
  const id = useId()
  const idErro = `${id}-erro`
  const idAjuda = `${id}-ajuda`
  const [senhaVisivel, setSenhaVisivel] = useState(false)

  const ehSenha = tipo === 'password'
  const tipoEfetivo = ehSenha && senhaVisivel ? 'text' : tipo

  const descritoPor = [erro ? idErro : null, ajuda ? idAjuda : null].filter(Boolean).join(' ')

  return (
    <div className="sp-campo">
      <label className="sp-apenas-leitor-de-tela" htmlFor={id}>
        {rotulo}
      </label>

      <div className={`sp-campo__caixa${erro ? ' sp-campo__caixa--erro' : ''}`}>
        <span className="sp-campo__icone">{icone}</span>

        <input
          id={id}
          className="sp-campo__input"
          type={tipoEfetivo}
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={desabilitado}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritoPor || undefined}
        />

        {ehSenha && (
          <button
            type="button"
            className="sp-campo__olho"
            onClick={() => setSenhaVisivel((visivel) => !visivel)}
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={senhaVisivel}
            disabled={desabilitado}
          >
            {senhaVisivel ? <IconeOlhoCortado /> : <IconeOlho />}
          </button>
        )}
      </div>

      {ajuda && !erro && (
        <p className="sp-campo__ajuda" id={idAjuda}>
          {ajuda}
        </p>
      )}

      {erro && (
        <p className="sp-campo__erro" id={idErro}>
          {erro}
        </p>
      )}
    </div>
  )
}
