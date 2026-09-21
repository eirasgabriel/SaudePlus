import { Link } from 'react-router-dom';
import { mockUnit } from '../services/dadosficticios';
import estilos from './ClinicasPage.module.css';

export default function ClinicasPage() {
  const clinicas = Array.isArray(mockUnit) ? mockUnit : [mockUnit];

  return (
    <div className={estilos.pagina}>
      <div className={estilos.conteudo}>
        <Link to="/" className={estilos.voltar}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M19.5 12h-15M11.5 4.5L4.5 12l7 7.5" />
          </svg>
          Voltar ao painel
        </Link>

        <header className={estilos.cabecalho}>
          <span className={estilos.icone} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
              <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
            </svg>
          </span>
          <div>
            <h1 className={estilos.titulo}>Unidades e Clínicas</h1>
            <p className={estilos.subtitulo}>
              Localize as unidades de atendimento, horários de funcionamento e endereços.
            </p>
          </div>
        </header>

        <section className={estilos.secao}>
          <div className={estilos.gridCards}>
            {clinicas.map((c, index) => (
              <div key={index} className={estilos.card}>
                <h3 className={estilos.nomeClinica}>{c.name || 'Unidade de Atendimento'}</h3>
                <p className={estilos.info}> <strong>Endereço:</strong> {c.address}</p>
                <p className={estilos.info}> <strong>Telefone:</strong> {c.phone}</p>
                <p className={estilos.info}> <strong>Horário:</strong> {c.hours}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}