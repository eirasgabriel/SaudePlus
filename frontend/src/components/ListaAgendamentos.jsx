import estilos from './ListaAgendamentos.module.css';

/* Versão de referência, compatível com o PacienteDashboard.
   Contrato esperado: <ListaAgendamentos agendamentos={[...]} /> */

const STATUS = {
  pendente: { rotulo: 'Pendente', tom: 'alerta' },
  confirmada: { rotulo: 'Confirmada', tom: 'sucesso' },
  aguardando: { rotulo: 'Aguardando', tom: 'alerta' },
  em_andamento: { rotulo: 'Em andamento', tom: 'sucesso' },
  realizada: { rotulo: 'Realizada', tom: 'neutro' },
  cancelada: { rotulo: 'Cancelada', tom: 'perigo' },
  faltou: { rotulo: 'Não compareceu', tom: 'perigo' },
};

const formatoDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });
const formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const formatoHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const formatoCompleto = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' });

const paraData = (valor) => (valor instanceof Date ? valor : new Date(valor));
const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const mesAbreviado = (valor) => capitalizar(formatoMes.format(paraData(valor)).replace('.', ''));

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

const IconeSeta = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />
  </svg>
);

export default function ListaAgendamentos({ agendamentos = [], linkAgendar = '#' }) {
  if (agendamentos.length === 0) {
    return (
      <div className={estilos.vazio}>
        <p>Você não tem consultas agendadas.</p>
        <a href={linkAgendar} className={estilos.linkVazio}>
          Agendar consulta
          <IconeSeta className={estilos.iconeSeta} />
        </a>
      </div>
    );
  }

  return (
    <ul className={estilos.lista}>
      {agendamentos.map((agendamento) => {
        const { id, dateTime, clinic, address, specialty, professional, status } = agendamento;
        const infoStatus = STATUS[status] ?? { rotulo: status, tom: 'neutro' };

        return (
          <li key={id} className={estilos.item}>
            <time className={estilos.data} dateTime={dateTime}>
              <span className={estilos.dia} aria-hidden="true">{formatoDia.format(paraData(dateTime))}</span>
              <span className={estilos.mes} aria-hidden="true">{mesAbreviado(dateTime)}</span>
              <span className={estilos.somenteLeitor}>{formatoCompleto.format(paraData(dateTime))}</span>
            </time>

            <div className={estilos.local}>
              <span className={estilos.titulo}>{clinic}</span>
              <span className={estilos.meta}>
                <IconePino className={estilos.metaIcone} />
                <span>{address}</span>
              </span>
            </div>

            <div className={estilos.profissional}>
              <IconeUsuario className={estilos.profissionalIcone} />
              <div>
                <span className={estilos.especialidade}>{specialty}</span>
                <span className={estilos.nomeProfissional}>{professional}</span>
              </div>
            </div>

            <span className={estilos.horario} aria-hidden="true">{formatoHora.format(paraData(dateTime))}</span>

            <span className={`${estilos.status} ${estilos[infoStatus.tom]}`}>{infoStatus.rotulo}</span>
          </li>
        );
      })}
    </ul>
  );
}
