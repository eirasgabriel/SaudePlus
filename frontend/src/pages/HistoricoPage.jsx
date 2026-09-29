import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockHistory } from '../services/dadosficticios';
import estilos from './HistoricoPage.module.css';

/* 
   FORMATADORES E APOIO
   */

const paraData = (valor) => (valor instanceof Date ? valor : new Date(valor));
const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const formatoLongo = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const formatoCompleto = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' });
const formatoAno = new Intl.DateTimeFormat('pt-BR', { year: 'numeric' });

const propsSvg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

const IconePino = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

const IconeUsuario = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <circle cx="12" cy="7.5" r="4.5" />
    <path d="M4 21.5v-1.5a5.5 5.5 0 0 1 5.5-5.5h5a5.5 5.5 0 0 1 5.5 5.5v1.5" />
  </svg>
);

const IconeEncaminhamento = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M14 2.5H6.5A2 2 0 0 0 4.5 4.5v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
    <path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h4" />
  </svg>
);

/* 
   CARTÃO DE ATENDIMENTO
   Campos vindos de mockHistory: dateTime, clinic, specialty,
   professional, summary, outcome.
    */

/** Estrelas de 1 a 5. Já avaliado mostra a nota; senão, botões para avaliar. */
function Avaliacao({ atendimento, aoAvaliar }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  if (atendimento.avaliacao != null) {
    return (
      <p className={estilos.avaliacao}>
        Sua avaliação:{' '}
        <span className={estilos.estrelas} aria-hidden="true">
          {'★'.repeat(atendimento.avaliacao)}{'☆'.repeat(5 - atendimento.avaliacao)}
        </span>
        <span className={estilos.somenteLeitor}>{atendimento.avaliacao} de 5</span>
      </p>
    );
  }
  if (!aoAvaliar) return null;

  const avaliar = async (nota) => {
    setEnviando(true);
    setErro(null);
    try {
      await aoAvaliar(atendimento, nota);
    } catch (falha) {
      setErro(falha?.message ?? 'Não foi possível registrar a avaliação.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={estilos.avaliacao}>
      <span>Como foi o atendimento?</span>
      <span className={estilos.estrelas} role="group" aria-label="Avaliar de 1 a 5 estrelas">
        {[1, 2, 3, 4, 5].map((nota) => (
          <button
            key={nota}
            type="button"
            className={estilos.estrela}
            onClick={() => avaliar(nota)}
            disabled={enviando}
            aria-label={`${nota} de 5`}
          >
            ★
          </button>
        ))}
      </span>
      {erro && <span className={estilos.erroAvaliacao} role="alert">{erro}</span>}
    </div>
  );
}

function CartaoAtendimento({ atendimento, aoAvaliar }) {
  const quando = paraData(atendimento.dateTime);

  return (
    <li className={estilos.item}>
      <span className={estilos.marcador} aria-hidden="true" />

      <article className={estilos.cartaoItem}>
        <div className={estilos.linhaTopo}>
          <h3 className={estilos.especialidade}>{atendimento.specialty}</h3>
          <time className={estilos.quando} dateTime={atendimento.dateTime}>
            <span aria-hidden="true">
              {capitalizar(formatoLongo.format(quando))} · {formatoHora.format(quando)}
            </span>
            <span className={estilos.somenteLeitor}>{formatoCompleto.format(quando)}</span>
          </time>
        </div>

        <p className={estilos.resumo}>{atendimento.summary}</p>

        <div className={estilos.detalhes}>
          <p className={estilos.meta}>
            <IconeUsuario className={estilos.metaIcone} />
            <span>{atendimento.professional}</span>
          </p>
          <p className={estilos.meta}>
            <IconePino className={estilos.metaIcone} />
            <span>{atendimento.clinic}</span>
          </p>
        </div>

        {atendimento.outcome && (
          <p className={estilos.desfecho}>
            <IconeEncaminhamento className={estilos.desfechoIcone} />
            <span>{atendimento.outcome}</span>
          </p>
        )}

        <Avaliacao atendimento={atendimento} aoAvaliar={aoAvaliar} />
      </article>
    </li>
  );
}

/* 
   PÁGINA
   Rota: /historico
    */

/** `aviso` aparece acima da lista; `aoAvaliar(atendimento, nota)` liga as estrelas. */
export default function HistoricoPage({ historico = mockHistory, aviso = null, aoAvaliar }) {
  /* Agrupa por ano, do atendimento mais recente para o mais antigo */
  const porAno = useMemo(() => {
    const ordenado = [...historico].sort(
      (a, b) => paraData(b.dateTime) - paraData(a.dateTime),
    );

    const grupos = new Map();
    for (const atendimento of ordenado) {
      const ano = formatoAno.format(paraData(atendimento.dateTime));
      if (!grupos.has(ano)) grupos.set(ano, []);
      grupos.get(ano).push(atendimento);
    }
    return [...grupos.entries()];
  }, [historico]);

  const total = historico.length;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.conteudo}>
        <Link to="/paciente" className={estilos.voltar}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M19.5 12h-15M11 5.5 4.5 12l6.5 6.5" />
          </svg>
          Voltar ao painel
        </Link>

        <header className={estilos.cabecalho}>
          <span className={estilos.icone} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M14 2.5H6.5A2 2 0 0 0 4.5 4.5v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
              <path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h7M8.5 9h2" />
            </svg>
          </span>
          <div>
            <h1 className={estilos.titulo}>Meu histórico</h1>
            <p className={estilos.subtitulo}>
              Veja todos os atendimentos que você já teve, com diagnósticos, receitas e encaminhamentos.
            </p>
          </div>
        </header>

        {aviso}

        {total > 0 ? (
          porAno.map(([ano, atendimentos]) => (
            <section key={ano} className={estilos.secao} aria-labelledby={`ano-${ano}`}>
              <div className={estilos.secaoCabecalho}>
                <h2 id={`ano-${ano}`} className={estilos.secaoTitulo}>{ano}</h2>
                <span className={estilos.contador}>
                  {atendimentos.length === 1 ? '1 atendimento' : `${atendimentos.length} atendimentos`}
                </span>
              </div>

              <ul className={estilos.linhaDoTempo}>
                {atendimentos.map((atendimento) => (
                  <CartaoAtendimento key={atendimento.id} atendimento={atendimento} aoAvaliar={aoAvaliar} />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <section className={estilos.secao}>
            <p className={estilos.vazio}>
              Seu histórico está vazio. Os atendimentos aparecem aqui depois da primeira consulta.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
