import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockExams } from '../services/dadosficticios';
import estilos from './ExamesPage.module.css';

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

// Mapeamento de status da API para rotulo e estilo
const STATUS = {
  liberado: { rotulo: 'Liberado', tom: 'sucesso' },
  'em análise': { rotulo: 'Em análise', tom: 'alerta' },
  em_analise: { rotulo: 'Em análise', tom: 'alerta' },
  agendado: { rotulo: 'Agendado', tom: 'informativo' },
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

const IconeFrasco = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M9.5 2.5h5M10 2.5v6.6L4.6 19.4A1.4 1.4 0 0 0 5.9 21.5h12.2a1.4 1.4 0 0 0 1.3-2.1L14 9.1V2.5" />
    <path d="M7 15h10" />
  </svg>
);

const IconeBaixar = ({ className }) => (
  <svg {...propsSvg} className={className} strokeWidth="2.1">
    <path d="M12 3.5v12M7.5 11l4.5 4.5 4.5-4.5M4.5 20.5h15" />
  </svg>
);

const IconeAmpulheta = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M7 2.5h10M7 21.5h10" />
    <path d="M8 2.5v4.2a4 4 0 0 0 1.4 3L12 12l-2.6 2.3a4 4 0 0 0-1.4 3v4.2M16 2.5v4.2a4 4 0 0 1-1.4 3L12 12l2.6 2.3a4 4 0 0 1 1.4 3v4.2" />
  </svg>
);

function CartaoExame({ exame }) {
  const quando = paraData(exame.dateTime);
  const statusChave = exame.status?.toLowerCase();
  const info = STATUS[statusChave] ?? { rotulo: exame.status, tom: 'neutro' };
  const liberado = Boolean(exame.resultUrl);

  return (
    <li className={estilos.cartao}>
      {/* Topo: selo de data, identificação e status */}
      <div className={estilos.topo}>
        <span className={estilos.selo} aria-hidden="true">
          <span className={estilos.seloDia}>{formatoDia.format(quando)}</span>
          <span className={estilos.seloMes}>{mesAbreviado(quando)}</span>
        </span>

        <div className={estilos.identificacao}>
          <h3 className={estilos.nomeExame}>{exame.name}</h3>
          <p className={estilos.categoria}>
            <IconeFrasco className={estilos.categoriaIcone} />
            <span>{exame.category}</span>
          </p>
        </div>

        <span className={classes(estilos.status, estilos[info.tom])}>
          <span className={estilos.statusPonto} aria-hidden="true" />
          {info.rotulo}
        </span>
      </div>

      {/* Detalhes: uma informação por linha */}
      <div className={estilos.detalhes}>
        <div className={estilos.linha}>
          <IconeCalendario className={estilos.linhaIcone} />
          <time className={estilos.linhaValor} dateTime={exame.dateTime}>
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
            <span className={estilos.local}>{exame.clinic}</span>
          </span>
        </div>

        <div className={classes(estilos.linha, estilos.linhaLarga)}>
          <IconeUsuario className={estilos.linhaIcone} />
          <span className={estilos.linhaValor}>{exame.professional}</span>
        </div>
      </div>

      {/* Ação */}
      <div className={estilos.rodape}>
        {liberado ? (
          <a
            className={estilos.botaoResultado}
            href={exame.resultUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <IconeBaixar className={estilos.botaoIcone} />
            Baixar resultado
            <span className={estilos.somenteLeitor}> de {exame.name}</span>
          </a>
        ) : (
          <p className={estilos.aguardando}>
            <IconeAmpulheta className={estilos.aguardandoIcone} />
            <span>
              {statusChave === 'agendado'
                ? 'O resultado fica disponível depois da coleta.'
                : 'O resultado é liberado assim que a análise terminar.'}
            </span>
          </p>
        )}
      </div>
    </li>
  );
}

export default function ExamesPage({ exames = mockExams }) {
  const { liberados, emAndamento } = useMemo(() => {
    const ordenados = [...exames].sort(
      (a, b) => paraData(b.dateTime) - paraData(a.dateTime)
    );

    return {
      liberados: ordenados.filter((item) => item.status?.toLowerCase() === 'liberado'),
      emAndamento: ordenados.filter((item) => item.status?.toLowerCase() !== 'liberado'),
    };
  }, [exames]);

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
              <path d="M9.5 2.5h5M10 2.5v6.6L4.6 19.4A1.4 1.4 0 0 0 5.9 21.5h12.2a1.4 1.4 0 0 0 1.3-2.1L14 9.1V2.5" />
              <path d="M7 15h10" />
            </svg>
          </span>
          <div>
            <h1 className={estilos.titulo}>Meus exames</h1>
            <p className={estilos.subtitulo}>
              Consulte resultados, baixe laudos e veja quais exames ainda estão em análise.
            </p>
          </div>
        </header>

        {/* Resultados liberados */}
        <section className={estilos.secao} aria-labelledby="exames-liberados">
          <div className={estilos.secaoCabecalho}>
            <h2 id="exames-liberados" className={estilos.secaoTitulo}>Resultados liberados</h2>
            <span className={estilos.contador}>
              {liberados.length === 1 ? '1 exame' : `${liberados.length} exames`}
            </span>
          </div>

          {liberados.length > 0 ? (
            <ul className={estilos.lista}>
              {liberados.map((exame) => (
                <CartaoExame key={exame.id} exame={exame} />
              ))}
            </ul>
          ) : (
            <p className={estilos.vazio}>Nenhum resultado liberado até agora.</p>
          )}
        </section>

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <section className={estilos.secao} aria-labelledby="exames-andamento">
            <div className={estilos.secaoCabecalho}>
              <h2 id="exames-andamento" className={estilos.secaoTitulo}>Em andamento</h2>
              <span className={estilos.contador}>
                {emAndamento.length === 1 ? '1 exame' : `${emAndamento.length} exames`}
              </span>
            </div>

            <ul className={estilos.lista}>
              {emAndamento.map((exame) => (
                <CartaoExame key={exame.id} exame={exame} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}