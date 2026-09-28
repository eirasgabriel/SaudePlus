import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockAppointments } from '../services/dadosficticios';
import estilos from './ConsultasPage.module.css';

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

const STATUS = {
  confirmada: { rotulo: 'Confirmada', tom: 'sucesso' },
  realizada: { rotulo: 'Realizada', tom: 'concluido' },
  pendente: { rotulo: 'Pendente', tom: 'alerta' },
  cancelada: { rotulo: 'Cancelada', tom: 'perigo' },
};

function statusExibido(consulta, passada) {
  const chave = passada && consulta.status === 'confirmada' ? 'realizada' : consulta.status;
  return STATUS[chave] ?? { rotulo: consulta.status, tom: 'neutro' };
}

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

function CartaoConsulta({ consulta, passada = false }) {
  const quando = paraData(consulta.dateTime);
  const info = statusExibido(consulta, passada);

  return (
    <li className={classes(estilos.cartao, passada && estilos.cartaoPassado)}>
      <div className={estilos.topo}>
        <span className={estilos.selo} aria-hidden="true">
          <span className={estilos.seloDia}>{formatoDia.format(quando)}</span>
          <span className={estilos.seloMes}>{mesAbreviado(quando)}</span>
        </span>

        <div className={estilos.identificacao}>
          <h3 className={estilos.especialidade}>{consulta.specialty}</h3>
          <p className={estilos.profissional}>
            <IconeUsuario className={estilos.profissionalIcone} />
            <span>{consulta.professional}</span>
          </p>
        </div>

        <span className={classes(estilos.status, estilos[info.tom])}>
          <span className={estilos.statusPonto} aria-hidden="true" />
          {info.rotulo}
        </span>
      </div>

      <div className={estilos.detalhes}>
        <div className={estilos.linha}>
          <IconeCalendario className={estilos.linhaIcone} />
          <time className={estilos.linhaValor} dateTime={consulta.dateTime}>
            {dataPorExtenso(quando)}
          </time>
        </div>

        <div className={estilos.linha}>
          <IconeRelogio className={estilos.linhaIcone} />
          <span className={estilos.linhaValor}>
            <span className={estilos.horario}>{formatoHora.format(quando)}</span>
          </span>
        </div>

        <div className={classes(estilos.linha, estilos.linhaLocal)}>
          <IconePino className={estilos.linhaIcone} />
          <span className={estilos.linhaValor}>
            <span className={estilos.local}>{consulta.clinic}</span>
            <span className={estilos.endereco}>{consulta.address}</span>
          </span>
        </div>
      </div>
    </li>
  );
}

export default function ConsultasPage({ consultas = mockAppointments }) {
  const { proximas, anteriores } = useMemo(() => {
    const agora = Date.now();

    const ordenadas = [...consultas].sort(
      (a, b) => paraData(a.dateTime) - paraData(b.dateTime)
    );

    return {
      proximas: ordenadas.filter((item) => paraData(item.dateTime).getTime() >= agora),
      anteriores: ordenadas
        .filter((item) => paraData(item.dateTime).getTime() < agora)
        .reverse(),
    };
  }, [consultas]);

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
              <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
              <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
              <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01M16 17h.01" />
            </svg>
          </span>
          <div>
            <h1 className={estilos.titulo}>Minhas consultas</h1>
            <p className={estilos.subtitulo}>
              Acompanhe seus agendamentos, remarque horários e cancele o que não precisa mais.
            </p>
          </div>
        </header>

        {/* Seção Próximas */}
        <section className={estilos.secao} aria-labelledby="proximas-consultas">
          <div className={estilos.secaoCabecalho}>
            <h2 id="proximas-consultas" className={estilos.secaoTitulo}>Próximas</h2>
            <span className={estilos.contador}>
              {proximas.length === 1 ? '1 consulta' : `${proximas.length} consultas`}
            </span>
          </div>

          {proximas.length > 0 ? (
            <ul className={estilos.lista}>
              {proximas.map((consulta) => (
                <CartaoConsulta key={consulta.id} consulta={consulta} />
              ))}
            </ul>
          ) : (
            <p className={estilos.vazio}>
              Você não tem consultas marcadas. Use o botão “Agendar agora” no painel para marcar uma.
            </p>
          )}
        </section>

        {/* Seção Anteriores */}
        {anteriores.length > 0 && (
          <section className={estilos.secao} aria-labelledby="consultas-anteriores">
            <div className={estilos.secaoCabecalho}>
              <h2 id="consultas-anteriores" className={estilos.secaoTitulo}>Anteriores</h2>
              <span className={estilos.contador}>
                {anteriores.length === 1 ? '1 consulta' : `${anteriores.length} consultas`}
              </span>
            </div>

            <ul className={estilos.lista}>
              {anteriores.map((consulta) => (
                <CartaoConsulta key={consulta.id} consulta={consulta} passada />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}