import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockHistory } from '../services/dadosficticios';
import estilos from './HistoricoPage.module.css';

const paraData = (valor) => (valor instanceof Date ? valor : new Date(valor));
const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const classes = (...lista) => lista.filter(Boolean).join(' ');

const formatoDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });
const formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const formatoExtenso = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const mesAbreviado = (valor) => capitalizar(formatoMes.format(paraData(valor)).replace('.', ''));
const dataPorExtenso = (valor) => capitalizar(formatoExtenso.format(paraData(valor)));

// O tipo vem da API em `type`. Cada tom reaproveita a cor da seção
// correspondente do app: consulta em azul, exame em verde e procedimento no roxo.
const TIPOS = {
  consulta: { rotulo: 'Consulta', tom: 'consulta' },
  exame: { rotulo: 'Exame', tom: 'exame' },
  procedimento: { rotulo: 'Procedimento', tom: 'procedimento' },
};

const tipoDe = (atendimento) =>
  TIPOS[atendimento.type?.toLowerCase()] ?? {
    rotulo: capitalizar(atendimento.type ?? 'Atendimento'),
    tom: 'neutro',
  };

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

const IconeCalendario = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
    <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
  </svg>
);

const IconeRelogio = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 6.5V12l3.5 2" />
  </svg>
);

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

const IconeNota = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M14 2.5H6.5A2 2 0 0 0 4.5 4.5v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
    <path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h4" />
  </svg>
);

const IconeDesfecho = ({ className }) => (
  <svg {...propsSvg} className={className} strokeWidth="2">
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

function CartaoAtendimento({ atendimento }) {
  const quando = paraData(atendimento.dateTime);
  const tipo = tipoDe(atendimento);

  return (
    <li className={estilos.cartao}>
      {/* Topo: selo de data, identificação e tipo */}
      <div className={estilos.topo}>
        <span className={estilos.selo} aria-hidden="true">
          <span className={estilos.seloDia}>{formatoDia.format(quando)}</span>
          <span className={estilos.seloMes}>{mesAbreviado(quando)}</span>
        </span>

        <div className={estilos.identificacao}>
          <h3 className={estilos.especialidade}>{atendimento.specialty}</h3>
          <p className={estilos.profissional}>
            <IconeUsuario className={estilos.profissionalIcone} />
            <span>{atendimento.professional}</span>
          </p>
        </div>

        <span className={classes(estilos.tipo, estilos[tipo.tom])}>
          <span className={estilos.tipoPonto} aria-hidden="true" />
          {tipo.rotulo}
        </span>
      </div>

      {/* Detalhes */}
      <div className={estilos.detalhes}>
        <div className={estilos.linha}>
          <IconeCalendario className={estilos.linhaIcone} />
          <time className={estilos.linhaValor} dateTime={atendimento.dateTime}>
            {dataPorExtenso(quando)}
          </time>
        </div>

        <div className={estilos.linha}>
          <IconeRelogio className={estilos.linhaIcone} />
          <span className={estilos.linhaValor}>
            <span className={estilos.horario}>{formatoHora.format(quando)}</span>
          </span>
        </div>

        <div className={classes(estilos.linha, estilos.linhaLarga)}>
          <IconePino className={estilos.linhaIcone} />
          <span className={estilos.linhaValor}>
            <span className={estilos.local}>{atendimento.clinic}</span>
            {atendimento.address && (
              <span className={estilos.endereco}>{atendimento.address}</span>
            )}
          </span>
        </div>

        {atendimento.summary && (
          <div className={classes(estilos.linha, estilos.linhaLarga)}>
            <IconeNota className={estilos.linhaIcone} />
            <p className={estilos.linhaValor}>{atendimento.summary}</p>
          </div>
        )}
      </div>

      {/* Rodapé: desfecho do atendimento */}
      {atendimento.outcome && (
        <div className={estilos.rodape}>
          <p className={estilos.desfecho}>
            <IconeDesfecho className={estilos.desfechoIcone} />
            <span>{atendimento.outcome}</span>
          </p>
        </div>
      )}
    </li>
  );
}

export default function HistoricoPage({ historico = mockHistory }) {
  /* Agrupa por ano, do atendimento mais recente para o mais antigo */
  const porAno = useMemo(() => {
    const ordenado = [...historico].sort(
      (a, b) => paraData(b.dateTime) - paraData(a.dateTime)
    );

    const grupos = new Map();
    for (const atendimento of ordenado) {
      const ano = paraData(atendimento.dateTime).getFullYear().toString();
      if (!grupos.has(ano)) grupos.set(ano, []);
      grupos.get(ano).push(atendimento);
    }
    return [...grupos.entries()];
  }, [historico]);

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

        {porAno.length > 0 ? (
          porAno.map(([ano, atendimentos]) => (
            <section key={ano} className={estilos.secao} aria-labelledby={`ano-${ano}`}>
              <div className={estilos.secaoCabecalho}>
                <h2 id={`ano-${ano}`} className={estilos.secaoTitulo}>{ano}</h2>
                <span className={estilos.contador}>
                  {atendimentos.length === 1 ? '1 atendimento' : `${atendimentos.length} atendimentos`}
                </span>
              </div>

              <ul className={estilos.lista}>
                {atendimentos.map((atendimento) => (
                  <CartaoAtendimento key={atendimento.id} atendimento={atendimento} />
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