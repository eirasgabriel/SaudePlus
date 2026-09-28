import { Link } from 'react-router-dom';
import { mockClinics } from '../services/dadosficticios';
import estilos from './ClinicasPage.module.css';

/** '(22) 2655-1234' → 'tel:+552226551234' */
const paraLinkTelefone = (telefone) => `tel:+55${telefone.replace(/\D/g, '')}`;

/**
 * Abre a localização da unidade no Google Maps, numa aba nova.
 *
 * O travessão que separa a unidade do bairro ("Clínica da Família – Centro")
 * atrapalha a busca do Maps, então ele vira vírgula antes de entrar na query.
 */
const abrirMapa = (nomeClinica, endereco) => {
  const busca = encodeURIComponent(`${nomeClinica}, ${endereco}`.replace(/\s*[\u2013\u2014-]\s*/g, ', '));
  const url = `https://www.google.com/maps/search/?api=1&query=${busca}`;

  // Criamos um elemento de link dinâmico para forçar a abertura em nova aba sem ser bloqueado
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
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

const IconePino = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

const IconeTelefone = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M21.5 16.9v2.8a1.9 1.9 0 0 1-2.1 1.9 18.8 18.8 0 0 1-8.2-2.9 18.5 18.5 0 0 1-5.7-5.7A18.8 18.8 0 0 1 2.6 4.6 1.9 1.9 0 0 1 4.5 2.5h2.8a1.9 1.9 0 0 1 1.9 1.6c.1.9.4 1.8.7 2.7a1.9 1.9 0 0 1-.4 2L8.3 10a15.2 15.2 0 0 0 5.7 5.7l1.2-1.2a1.9 1.9 0 0 1 2-.4c.9.3 1.8.6 2.7.7a1.9 1.9 0 0 1 1.6 2.1" />
  </svg>
);

const IconeRelogio = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 6.5V12l3.5 2" />
  </svg>
);

const IconeLinkExterno = ({ className }) => (
  <svg {...propsSvg} className={className} strokeWidth="2">
    <path d="M14 4.5h5.5V10M19 5l-8 8" />
    <path d="M18 14.5v4a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </svg>
);

/** Miniatura de mapa, a mesma usada no painel */
function MiniaturaMapa() {
  return (
    <div className={estilos.mapa} aria-hidden="true">
      <svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice">
        <rect width="120" height="120" fill="#FDE7EE" />
        <path d="M-10 70 130 20M-10 110 130 60M30 -10 70 130M-10 30 130 100" stroke="#fff" strokeWidth="8" />
        <path d="M-10 90 130 40" stroke="#fff" strokeWidth="4" />
        <path
          d="M60 38c-8 0-14 5.9-14 13.4 0 10 14 22.6 14 22.6s14-12.6 14-22.6C74 43.9 68 38 60 38z"
          fill="#F0436B"
        />
        <circle cx="60" cy="51" r="5" fill="#fff" />
      </svg>
    </div>
  );
}

// Campos que o cartão consome de cada unidade: name, address, phone, hours,
// specialties, mapUrl e isPatientUnit.

function CartaoClinica({ clinica }) {
  return (
    <li className={estilos.cartaoItem}>
      <MiniaturaMapa />

      <div className={estilos.corpo}>
        <div className={estilos.linhaTopo}>
          <h3 className={estilos.nome}>{clinica.name}</h3>
          {clinica.isPatientUnit && <span className={estilos.selo}>Sua unidade</span>}
        </div>

        <address className={estilos.detalhes}>
          <p className={estilos.meta}>
            <IconePino className={estilos.metaIcone} />
            <span>{clinica.address}</span>
          </p>
          <p className={estilos.meta}>
            <IconeTelefone className={estilos.metaIcone} />
            <a className={estilos.telefone} href={paraLinkTelefone(clinica.phone)}>{clinica.phone}</a>
          </p>
          <p className={estilos.meta}>
            <IconeRelogio className={estilos.metaIcone} />
            <span>{clinica.hours}</span>
          </p>
        </address>

        {clinica.specialties?.length > 0 && (
          <ul className={estilos.especialidades} aria-label={`Especialidades em ${clinica.name}`}>
            {clinica.specialties.map((especialidade) => (
              <li key={especialidade} className={estilos.etiqueta}>{especialidade}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={estilos.acao}
          onClick={() => abrirMapa(clinica.name, clinica.address)}
        >
          Ver no mapa
          <IconeLinkExterno className={estilos.acaoIcone} />
          <span className={estilos.somenteLeitor}>
            {`${clinica.name}, abre o Google Maps em uma nova aba`}
          </span>
        </button>
      </div>
    </li>
  );
}

export default function ClinicasPage({ clinicas = mockClinics }) {
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
              <path d="M6 21.5V4.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
              <path d="M6 9.5H4a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 21.5h16a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 20 9.5h-2" />
              <path d="M12 5.5v4M10 7.5h4M10 13h.01M14 13h.01M10.5 21.5v-4h3v4" />
            </svg>
          </span>
          <div>
            <h1 className={estilos.titulo}>Clínicas</h1>
            <p className={estilos.subtitulo}>
              Encontre endereços, horários e contatos das unidades da rede.
            </p>
          </div>
        </header>

        <section className={estilos.secao} aria-labelledby="unidades-da-rede">
          <div className={estilos.secaoCabecalho}>
            <h2 id="unidades-da-rede" className={estilos.secaoTitulo}>Unidades da rede</h2>
            <span className={estilos.contador}>
              {clinicas.length === 1 ? '1 unidade' : `${clinicas.length} unidades`}
            </span>
          </div>

          {clinicas.length > 0 ? (
            <ul className={estilos.lista}>
              {clinicas.map((clinica) => (
                <CartaoClinica key={clinica.id} clinica={clinica} />
              ))}
            </ul>
          ) : (
            <p className={estilos.vazio}>Nenhuma unidade cadastrada até o momento.</p>
          )}
        </section>
      </div>
    </div>
  );
}
