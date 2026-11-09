import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockPatient, mockClinics } from '../services/dadosficticios';
import estilos from './PerfilPage.module.css';

const classes = (...lista) => lista.filter(Boolean).join(' ');

// Trata se mockClinics for array ou objeto único
const unidadePadrao = Array.isArray(mockClinics) ? mockClinics[0] : mockClinics;

const DADOS_INICIAIS = {
  nomeCompleto: mockPatient?.name || 'Maria Silva',
  dataNascimento: mockPatient?.birthDate || '1991-04-17',
  cpf: mockPatient?.cpf || '123.456.789-00',
  cartaoSus: mockPatient?.susCard || '700 1234 5678 9012',
  telefone: mockPatient?.phone || '(22) 99876-5432',
  email: mockPatient?.email || 'maria.silva@email.com',
  endereco: mockPatient?.address || 'Rua das Acácias, 88 — Centro',
  cidade: mockPatient?.city || 'Saquarema, RJ',
  cep: mockPatient?.zipCode || '28990-000',
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

const IconeUsuario = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <circle cx="12" cy="7.5" r="4.5" />
    <path d="M4 21.5v-1.5a5.5 5.5 0 0 1 5.5-5.5h5a5.5 5.5 0 0 1 5.5 5.5v1.5" />
  </svg>
);

const IconeContato = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const IconePredio = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M3 21.5h18M5 21.5V8l7-3v16.5M12 21.5V3h7v18.5" />
    <path d="M8 11h1M8 14.5h1M8 18h1M15 7h1M15 10.5h1M15 14h1M15 17.5h1" />
  </svg>
);

const IconePino = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <path d="M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

const IconeRelogio = ({ className }) => (
  <svg {...propsSvg} className={className}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 6.5V12l3.5 2" />
  </svg>
);

const IconeCheck = ({ className }) => (
  <svg {...propsSvg} className={className} strokeWidth="2.2">
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

function Campo({ id, rotulo, valor, tipo = 'text', onChange, ajuda, somenteLeitura = false }) {
  return (
    <div className={estilos.campo}>
      <label className={estilos.rotulo} htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        type={tipo}
        className={classes(estilos.input, somenteLeitura && estilos.inputTravado)}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        readOnly={somenteLeitura}
      />
      {ajuda && <p className={estilos.ajuda}>{ajuda}</p>}
    </div>
  );
}

export default function PerfilPage({ paciente = mockPatient, unidade = unidadePadrao, aoSalvar }) {
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [salvo, setSalvo] = useState(false);

  const unidadeAtiva = Array.isArray(unidade) ? unidade[0] : unidade;
  const alterado = Object.keys(DADOS_INICIAIS).some((campo) => dados[campo] !== DADOS_INICIAIS[campo]);

  function alterarCampo(campo, valor) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }));
    setSalvo(false);
  }

  function enviar(evento) {
    evento.preventDefault();
    aoSalvar?.(dados);
    setSalvo(true);
  }

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
          <span className={estilos.avatar} aria-hidden="true">
            {paciente?.avatarUrl ? (
              <img src={paciente.avatarUrl} alt="" />
            ) : (
              <svg viewBox="0 0 48 48">
                <circle cx="24" cy="18" r="8.5" fill="currentColor" />
                <path d="M8 44c1.5-9 8-14 16-14s14.5 5 16 14z" fill="currentColor" />
              </svg>
            )}
          </span>
          <div>
            <h1 className={estilos.titulo}>Minhas informações</h1>
            <p className={estilos.subtitulo}>
              Confira e atualize seus dados de cadastro e contato. A clínica usa
              essas informações para falar com você.
            </p>
          </div>
        </header>

        <form onSubmit={enviar}>
          <section className={estilos.secao} aria-labelledby="dados-pessoais">
            <div className={estilos.secaoCabecalho}>
              <IconeUsuario className={estilos.secaoIcone} />
              <h2 id="dados-pessoais" className={estilos.secaoTitulo}>Dados pessoais</h2>
            </div>

            <div className={estilos.grade}>
              <Campo
                id="perfil-nome"
                rotulo="Nome completo"
                valor={dados.nomeCompleto}
                onChange={(v) => alterarCampo('nomeCompleto', v)}
              />
              <Campo
                id="perfil-nascimento"
                rotulo="Data de nascimento"
                tipo="date"
                valor={dados.dataNascimento}
                onChange={(v) => alterarCampo('dataNascimento', v)}
              />
              <Campo
                id="perfil-cpf"
                rotulo="CPF"
                valor={dados.cpf}
                onChange={(v) => alterarCampo('cpf', v)}
                ajuda="Para mudar o CPF, procure a recepção com um documento com foto."
                somenteLeitura
              />
              <Campo
                id="perfil-sus"
                rotulo="Cartão SUS"
                valor={dados.cartaoSus}
                onChange={(v) => alterarCampo('cartaoSus', v)}
              />
            </div>
          </section>

          <section className={estilos.secao} aria-labelledby="dados-contato">
            <div className={estilos.secaoCabecalho}>
              <IconeContato className={estilos.secaoIcone} />
              <h2 id="dados-contato" className={estilos.secaoTitulo}>Contato</h2>
            </div>

            <div className={estilos.grade}>
              <Campo
                id="perfil-telefone"
                rotulo="Telefone"
                tipo="tel"
                valor={dados.telefone}
                onChange={(v) => alterarCampo('telefone', v)}
                ajuda="É por aqui que a clínica avisa sobre mudanças de horário."
              />
              <Campo
                id="perfil-email"
                rotulo="E-mail"
                tipo="email"
                valor={dados.email}
                onChange={(v) => alterarCampo('email', v)}
              />
              <Campo
                id="perfil-endereco"
                rotulo="Endereço"
                valor={dados.endereco}
                onChange={(v) => alterarCampo('endereco', v)}
              />
              <Campo
                id="perfil-cidade"
                rotulo="Cidade"
                valor={dados.cidade}
                onChange={(v) => alterarCampo('cidade', v)}
              />
              <Campo
                id="perfil-cep"
                rotulo="CEP"
                valor={dados.cep}
                onChange={(v) => alterarCampo('cep', v)}
              />
            </div>
          </section>

          <div className={estilos.acoes}>
            {salvo && (
              <p className={estilos.confirmacao} role="status">
                <IconeCheck className={estilos.confirmacaoIcone} />
                Dados atualizados.
              </p>
            )}
            <button type="submit" className={estilos.botaoSalvar} disabled={!alterado}>
              Salvar alterações
            </button>
          </div>
        </form>

        <section className={estilos.secao} aria-labelledby="unidade-referencia">
          <div className={estilos.secaoCabecalho}>
            <IconePredio className={estilos.secaoIcone} />
            <h2 id="unidade-referencia" className={estilos.secaoTitulo}>Unidade de referência</h2>
          </div>

          <div className={estilos.unidade}>
            <span className={estilos.unidadeNome}>{unidadeAtiva?.name}</span>
            <p className={estilos.meta}>
              <IconePino className={estilos.metaIcone} />
              <span>{unidadeAtiva?.address}</span>
            </p>
            <p className={estilos.meta}>
              <IconeRelogio className={estilos.metaIcone} />
              <span>{unidadeAtiva?.hours}</span>
            </p>
            <Link to="/paciente/clinicas" className={estilos.unidadeLink}>Ver todas as unidades</Link>
          </div>
        </section>
      </div>
    </div>
  );
}