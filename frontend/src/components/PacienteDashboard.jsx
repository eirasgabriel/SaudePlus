import { useId, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import MenuPerfil from './MenuPerfil/MenuPerfil.jsx';
import { useAuth } from '../features/auth/auth.context.js';
import ListaAgendamentos from './ListaAgendamentos';
import ModalAgendamento from './ModalAgendamento';
import {
  mockAppointments,
  mockNotificationCount,
  mockPatient,
  mockUnit,
} from '../services/dadosficticios';
import estilos from './PacienteDashboard.module.css';

/* 
   CONFIGURAÇÃO DE NAVEGAÇÃO E ATALHOS

   `para` é a rota do react-router-dom. Itens sem `para` ainda não
   têm rota: são renderizados como âncora inerte. Ao criar a rota,
   basta preencher o `para` — nada mais muda.
    */

const MENU_TOPO = [
  { rotulo: 'Início', icone: 'inicio', para: '/paciente' },
  { rotulo: 'Consultas', icone: 'calendario', para: '/paciente/consultas' },
  { rotulo: 'Exames', icone: 'frasco', para: '/paciente/exames' },
  { rotulo: 'Histórico', icone: 'arquivo', para: '/paciente/historico' },
  { rotulo: 'Clínicas', icone: 'hospital', para: '/paciente/clinicas' },
];

const MENU_LATERAL = [
  { rotulo: 'Visão geral', icone: 'inicio', para: '/paciente' },
  { rotulo: 'Minhas consultas', icone: 'calendario', para: '/paciente/consultas' },
  { rotulo: 'Meus exames', icone: 'frasco', para: '/paciente/exames' },
  { rotulo: 'Meu histórico', icone: 'arquivo', para: '/paciente/historico' },
  { rotulo: 'Minhas informações', icone: 'usuario', para: '/paciente/perfil' },
  { rotulo: 'Notificações', icone: 'sino', para: '/paciente/notificacoes' },
];

const CARDS_ATALHO = [
  {
    tom: 'azul',
    icone: 'calendario',
    titulo: 'Próximas consultas',
    descricao: 'Veja seus agendamentos e gerencie sua agenda.',
    rotuloLink: 'Ver consultas',
    para: '/paciente/consultas',
  },
  {
    tom: 'verde',
    icone: 'frasco',
    titulo: 'Exames',
    descricao: 'Acesse seus exames e resultados.',
    rotuloLink: 'Ver exames',
    para: '/paciente/exames',
  },
  {
    tom: 'roxo',
    icone: 'arquivo',
    titulo: 'Histórico',
    descricao: 'Confira todo o seu histórico de atendimentos.',
    rotuloLink: 'Ver histórico',
    para: '/paciente/historico',
  },
  {
    tom: 'rosa',
    icone: 'hospital',
    titulo: 'Clínicas',
    descricao: 'Encontre endereços, horários e contatos.',
    rotuloLink: 'Ver clínicas',
    para: '/paciente/clinicas',
  },
];

const ACESSO_RAPIDO = [
  { rotulo: 'Consultar resultados de exames', icone: 'frasco', para: '/paciente/exames' },
  { rotulo: 'Ver minhas consultas', icone: 'calendario', para: '/paciente/consultas' },
  { rotulo: 'Atualizar meus dados', icone: 'usuario', para: '/paciente/perfil' },
  // Sem chat: leva aos contatos (telefone e endereço) das unidades.
  { rotulo: 'Falar com a clínica', icone: 'conversa', para: '/paciente/clinicas' },
];

/* 
   UTILITÁRIOS
*/

/** Junta classes CSS ignorando valores falsy. */
const classes = (...lista) => lista.filter(Boolean).join(' ');

/** "(22) 2655-1234" -> "tel:+552226551234" */
const paraLinkTelefone = (telefone) => `tel:+55${telefone.replace(/\D/g, '')}`;

/* 
   ÍCONES SVG (traço 24×24, cor via currentColor)
    */

const ICONES = {
  inicio: <path d="M3 10.2 12 3l9 7.2V20a1.5 1.5 0 0 1-1.5 1.5H15v-6.5H9v6.5H4.5A1.5 1.5 0 0 1 3 20z" />,
  calendario: (
    <>
      <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
      <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
      <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01M16 17h.01" />
    </>
  ),
  calendarioMais: (
    <>
      <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
      <path d="M8 2.5v4M16 2.5v4M3 9.5h18M12 12.5v6M9 15.5h6" />
    </>
  ),
  frasco: (
    <>
      <path d="M9.5 2.5h5M10 2.5v6.6L4.6 19.4A1.4 1.4 0 0 0 5.9 21.5h12.2a1.4 1.4 0 0 0 1.3-2.1L14 9.1V2.5" />
      <path d="M7 15h10" />
    </>
  ),
  arquivo: (
    <>
      <path d="M14 2.5H6.5A2 2 0 0 0 4.5 4.5v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
      <path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h7M8.5 9h2" />
    </>
  ),
  hospital: (
    <>
      <path d="M6 21.5V4.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
      <path d="M6 9.5H4a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 21.5h16a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 20 9.5h-2" />
      <path d="M12 5.5v4M10 7.5h4M10 13h.01M14 13h.01M10.5 21.5v-4h3v4" />
    </>
  ),
  predio: (
    <>
      <path d="M3 21.5h18M5 21.5V8l7-3v16.5M12 21.5V3h7v18.5" />
      <path d="M8 11h1M8 14.5h1M8 18h1M15 7h1M15 10.5h1M15 14h1M15 17.5h1" />
    </>
  ),
  busca: (
    <>
      <circle cx="10.5" cy="10.5" r="7.5" />
      <path d="m21 21-5.2-5.2" />
    </>
  ),
  sino: (
    <>
      <path d="M6 8.5a6 6 0 0 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15 6 8.5" />
      <path d="M10.3 20.5a2 2 0 0 0 3.4 0" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="7.5" r="4.5" />
      <path d="M4 21.5v-1.5a5.5 5.5 0 0 1 5.5-5.5h5a5.5 5.5 0 0 1 5.5 5.5v1.5" />
    </>
  ),
  setaBaixo: <path d="m6 9 6 6 6-6" />,
  setaDireita: <path d="m9 6 6 6-6 6" />,
  seta: <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />,
  coracao: (
    <path d="M12 20.5s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 8.3 4.5c1.6 0 2.9.8 3.7 2 .8-1.2 2.1-2 3.7-2a4.8 4.8 0 0 1 4.8 4.8c0 6.1-8.5 11.2-8.5 11.2z" />
  ),
  raio: <path d="M13.5 1.5 3.5 14h7.5l-1 8.5 10-12.5h-7.5z" />,
  conversa: (
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </>
  ),
  pino: (
    <>
      <path d="M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  telefone: (
    <path d="M21.5 16.9v2.8a1.9 1.9 0 0 1-2.1 1.9 18.8 18.8 0 0 1-8.2-2.9 18.5 18.5 0 0 1-5.7-5.7A18.8 18.8 0 0 1 2.6 4.6 1.9 1.9 0 0 1 4.5 2.5h2.8a1.9 1.9 0 0 1 1.9 1.6c.1.9.4 1.8.7 2.7a1.9 1.9 0 0 1-.4 2L8.3 10a15.2 15.2 0 0 0 5.7 5.7l1.2-1.2a1.9 1.9 0 0 1 2-.4c.9.3 1.8.6 2.7.7a1.9 1.9 0 0 1 1.6 2.1" />
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
};

function Icone({ nome, preenchido = false, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      className={className}
      fill={preenchido ? 'currentColor' : 'none'}
      stroke={preenchido ? 'none' : 'currentColor'}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {ICONES[nome]}
    </svg>
  );
}

/**
 * Link de texto azul com seta.
 * `para` navega pelo router (<Link to>); `href` sai para um endereço externo.
 */
function LinkSeta({ para, href = '#', pequeno = false, className, children, ...resto }) {
  const classe = classes(estilos.linkSeta, pequeno && estilos.linkSetaPequeno, className);
  const conteudo = (
    <>
      {children}
      <Icone nome="seta" className={estilos.linkSetaIcone} />
    </>
  );

  if (para) {
    return <Link to={para} className={classe} {...resto}>{conteudo}</Link>;
  }
  return <a href={href} className={classe} {...resto}>{conteudo}</a>;
}

/**
 * Item de menu (topo e lateral).
 *
 * Usa <NavLink>, que marca sozinho o item da rota atual com
 * aria-current="page" — o mesmo seletor que o CSS já usava para o
 * estado ativo. Por isso o PacienteDashboard.module.css não mudou.
 */
function LinkNavegacao({ item, className, classeIcone }) {
  const conteudo = (ativo) => (
    <>
      <Icone
        nome={item.icone}
        preenchido={ativo && item.icone === 'inicio'}
        className={classeIcone}
      />
      {item.rotulo}
    </>
  );

  // Sem rota ainda: âncora inerte, com o mesmo visual
  if (!item.para) {
    return <a href="#" className={className}>{conteudo(false)}</a>;
  }

  return (
    // `end` evita que "/paciente" fique ativa em todas as rotas
    <NavLink to={item.para} end={item.para === '/paciente'} className={className}>
      {({ isActive }) => conteudo(isActive)}
    </NavLink>
  );
}

/* 
   COMPONENTE PRINCIPAL
   =*/

/**
  Dashboard do Paciente — SaúdePlus
 
Sem props, usa os dados de ../services/dadosficticios.js.
Na integração, passe os dados da API:
<PacienteDashboard paciente={...} agendamentos={...} unidade={...} totalNotificacoes={3} />
 
Precisa estar dentro de um <BrowserRouter> (ver src/App.jsx), porque usa
Link, NavLink e useNavigate do react-router-dom.
 
O modal de agendamento é controlado aqui. Para assumir o fluxo por fora,
passe `aoAgendar` (abre o seu próprio) ou `aoConfirmarAgendamento`
(recebe os dados do formulário e chama a API).
 */
export default function PacienteDashboard({
  paciente = mockPatient,
  agendamentos = mockAppointments,
  unidade = mockUnit,
  totalNotificacoes = mockNotificationCount,
  imagemBoasVindas,
  rotaAgendamento = '/paciente/consultas',
  aoAgendar,
  aoConfirmarAgendamento,
  aoPesquisar,
  aoAbrirNotificacoes,
  aoAbrirPerfil,
}) {
  const prefixoId = `pd-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const ids = {
    boasVindas: `${prefixoId}-boas-vindas`,
    consultas: `${prefixoId}-consultas`,
    seguranca: `${prefixoId}-seguranca`,
    agendar: `${prefixoId}-agendar`,
    acessoRapido: `${prefixoId}-acesso-rapido`,
    unidade: `${prefixoId}-unidade`,
    gradienteFundo: `${prefixoId}-gradiente-fundo`,
    gradienteEscudo: `${prefixoId}-gradiente-escudo`,
  };

  const { name: nomePaciente, role: perfilPaciente, avatarUrl: fotoPaciente } = paciente;

  /* Menu da conta, o mesmo componente das outras duas áreas. O botão do nome
     já existia, mas chamava uma prop `aoAbrirPerfil` que ninguém passava —
     ou seja, não abria nada. */
  const [contaAberta, setContaAberta] = useState(false);
  const botaoConta = useRef(null);
  const idMenuConta = `${prefixoId}-menu-conta`;
  const rotuloContador = totalNotificacoes > 9 ? '9+' : totalNotificacoes;

  const navegar = useNavigate();

  const { sair } = useAuth();

  const itensDaConta = [
    {
      rotulo: 'Minha conta',
      href: '/paciente/perfil',
      onSelecionar: (evento) => {
        evento.preventDefault();
        navegar('/paciente/perfil');
      },
    },
    { rotulo: 'Ajuda', href: '/ajuda' },
    {
      rotulo: 'Sair',
      href: '/login',
      separado: true,
      destaque: true,
      /* Encerrar a sessão antes de navegar: com o token ainda válido, o
         RotaProtegida devolveria a pessoa para o painel. */
      onSelecionar: (evento) => {
        evento.preventDefault();
        sair();
        navegar('/login', { replace: true });
      },
    },
  ];

  /* Estado do modal de agendamento. Os dois gatilhos — o botão
     "Agendar agora" e o link "Agendar consulta" do estado vazio da
     lista — abrem o mesmo modal. */
  const [modalAberto, setModalAberto] = useState(false);

  const abrirAgendamento = () => {
    // `aoAgendar` permite que a tela pai assuma o fluxo (outro modal, outra rota)
    if (aoAgendar) {
      aoAgendar();
      return;
    }
    setModalAberto(true);
  };

  const fecharAgendamento = () => setModalAberto(false);

  const confirmarAgendamento = (dados) => {
    // Devolve a promessa: o modal espera a resposta e mostra o erro, se houver.
    if (aoConfirmarAgendamento) {
      return aoConfirmarAgendamento(dados);
    }
    // Sem integração ainda: leva o paciente para a lista de consultas
    navegar(rotaAgendamento, { state: { agendamento: dados } });
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.app}>
        {/* 
            CABEÇALHO
            */}
        <header className={estilos.cabecalho}>
          <Link to="/" className={estilos.marca} aria-label="SaúdePlus, página inicial">
            <span className={estilos.nomeMarca}>
              Saúde<span>Plus</span>
            </span>
            <span className={estilos.slogan}>A sua saúde, sempre andando junto com você!</span>
          </Link>

          <nav className={estilos.menuTopo} aria-label="Navegação principal">
            {MENU_TOPO.map((item) => (
              <LinkNavegacao
                key={item.rotulo}
                item={item}
                className={estilos.linkMenuTopo}
                classeIcone={estilos.iconeMenuTopo}
              />
            ))}
          </nav>

          <div className={estilos.acoes}>
            <button
              type="button"
              className={estilos.botaoIcone}
              aria-label="Pesquisar profissionais"
              onClick={aoPesquisar ?? (() => navegar('/buscar'))}
            >
              <Icone nome="busca" />
            </button>

            <button
              type="button"
              className={estilos.botaoIcone}
              aria-label={totalNotificacoes > 0 ? `Notificações, ${totalNotificacoes} não lidas` : 'Notificações'}
              onClick={aoAbrirNotificacoes ?? (() => navegar('/paciente/notificacoes'))}
            >
              <Icone nome="sino" />
              {totalNotificacoes > 0 && (
                <span className={estilos.contador} aria-hidden="true">{rotuloContador}</span>
              )}
            </button>

            <span className={estilos.divisor} aria-hidden="true" />

            <button
              type="button"
              ref={botaoConta}
              className={estilos.perfil}
              aria-haspopup="menu"
              aria-expanded={contaAberta}
              aria-controls={idMenuConta}
              aria-label={`Menu da conta de ${nomePaciente}`}
              onClick={() => {
                aoAbrirPerfil?.();
                setContaAberta((aberta) => !aberta);
              }}
            >
              <span className={estilos.avatar} aria-hidden="true">
                {fotoPaciente ? (
                  <img src={fotoPaciente} alt="" />
                ) : (
                  <svg viewBox="0 0 48 48">
                    <circle cx="24" cy="18" r="8.5" fill="currentColor" />
                    <path d="M8 44c1.5-9 8-14 16-14s14.5 5 16 14z" fill="currentColor" />
                  </svg>
                )}
              </span>
              <span className={estilos.textoPerfil} aria-hidden="true">
                <span className={estilos.nomePerfil}>{nomePaciente}</span>
                <span className={estilos.papelPerfil}>{perfilPaciente}</span>
              </span>
              <Icone nome="setaBaixo" className={estilos.setaPerfil} />
            </button>

            <MenuPerfil
              id={idMenuConta}
              aberto={contaAberta}
              aoFechar={() => setContaAberta(false)}
              botaoDeOrigem={botaoConta}
              itens={itensDaConta}
            />
          </div>
        </header>

        <div className={estilos.grade}>
          {/* 
              MENU LATERAL
             */}
          <aside className={estilos.menuLateral} aria-label="Menu do paciente">
            <nav>
              <ul className={estilos.listaMenuLateral}>
                {MENU_LATERAL.map((item) => (
                  <li key={item.rotulo}>
                    <LinkNavegacao
                      item={item}
                      className={estilos.linkMenuLateral}
                      classeIcone={estilos.iconeMenuLateral}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            <div className={estilos.cardCuidado}>
              <Icone nome="coracao" className={estilos.iconeCuidado} />
              <p className={estilos.textoCuidado}>
                Cuidar de você
                <br />é a nossa prioridade!
              </p>
              <svg className={estilos.arteCuidado} viewBox="0 0 210 110" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 60 C 40 30, 80 90, 130 55 S 190 20, 210 35 V110 H0z" fill="#C9DEFF" opacity=".55" />
                <path d="M0 85 C 50 60, 100 105, 150 80 S 200 60, 210 70 V110 H0z" fill="#B7D3FF" opacity=".55" />
                <path
                  d="M145 52c-4-7-15-6-15 3 0 8 15 17 15 17s15-9 15-17c0-9-11-10-15-3z"
                  fill="none"
                  stroke="#2F8BFF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  transform="translate(-6 -8) scale(1.08)"
                />
              </svg>
            </div>
          </aside>

          {/* 
              CONTEÚDO CENTRAL
            */}
          <main className={estilos.conteudo}>
            {/*  Boas-vindas  */}
            <section className={estilos.boasVindas} aria-labelledby={ids.boasVindas}>
              <div className={estilos.boasVindasConteudo}>
                <h1 id={ids.boasVindas} className={estilos.boasVindasTitulo}>Olá, {nomePaciente}!</h1>
                <p className={estilos.boasVindasSubtitulo}>Seja bem-vinda ao seu painel de cuidados.</p>
                <div className={estilos.aviso}>
                  <Icone nome="coracao" className={estilos.iconeAviso} />
                  <p>
                    Aqui você encontra suas consultas, exames e todas as informações sobre o seu
                    atendimento de forma rápida e segura.
                  </p>
                </div>
              </div>

              {/* Sem `imagemBoasVindas`, exibe uma ilustração provisória */}
              <div className={estilos.boasVindasVisual} aria-hidden="true">
                {imagemBoasVindas ? (
                  <img src={imagemBoasVindas} alt="" />
                ) : (
                  <svg viewBox="0 0 330 226" preserveAspectRatio="xMaxYMax slice">
                    <defs>
                      <linearGradient id={ids.gradienteFundo} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#D5E6FF" />
                        <stop offset="1" stopColor="#A8CAFF" />
                      </linearGradient>
                    </defs>
                    <path d="M40 226C30 150 80 70 160 36 230 8 300 0 330 0v226z" fill={`url(#${ids.gradienteFundo})`} opacity=".75" />
                    <path d="M130 118c-8-58 22-92 60-92s66 32 62 86c-2 34-6 60-2 88l-116 6c8-28 0-56-4-88z" fill="#3A2620" />
                    <path d="M172 140v34c8 10 28 10 36 0v-34z" fill="#DDA27F" />
                    <path d="M92 226c4-34 30-52 70-58 6 8 20 12 28 12s22-4 28-12c40 6 66 24 70 58z" fill="#8DB5E8" />
                    <path d="M162 168c6 8 20 12 28 12s22-4 28-12" fill="none" stroke="#7AA6DE" strokeWidth="3" />
                    <ellipse cx="190" cy="104" rx="37" ry="45" fill="#F0C3A3" />
                    <path d="M152 104c-4-40 18-62 44-60 22 2 36 20 34 50-14-24-38-34-78 10z" fill="#3A2620" />
                    <path d="M226 92c10 30 8 70 30 104-14 4-26-8-30-20z" fill="#3A2620" />
                    <path d="M172 104q5-4 10 0M198 104q5-4 10 0" fill="none" stroke="#3A2620" strokeWidth="2.6" strokeLinecap="round" />
                    <path d="M176 122q14 12 28 0z" fill="#fff" stroke="#B5584A" strokeWidth="2" strokeLinejoin="round" />
                    <circle cx="168" cy="118" r="5" fill="#F4A99A" opacity=".45" />
                    <circle cx="212" cy="118" r="5" fill="#F4A99A" opacity=".45" />
                  </svg>
                )}
              </div>
            </section>

            {/* Cards de atalho */}
            <section className={estilos.gradeAtalhos} aria-label="Atalhos do painel">
              {CARDS_ATALHO.map((card) => (
                <article key={card.titulo} className={classes(estilos.cardAtalho, estilos[card.tom])}>
                  <span className={estilos.iconeAtalho} aria-hidden="true">
                    <Icone nome={card.icone} />
                  </span>
                  <h2 className={estilos.tituloAtalho}>{card.titulo}</h2>
                  <p className={estilos.descricaoAtalho}>{card.descricao}</p>
                  <LinkSeta para={card.para} className={estilos.linkAtalho}>
                    {card.rotuloLink}
                  </LinkSeta>
                </article>
              ))}
            </section>

            {/*  Suas próximas consultas */}
            <section className={estilos.painel} aria-labelledby={ids.consultas}>
              <header className={estilos.painelCabecalho}>
                <Icone nome="calendario" className={estilos.painelIcone} />
                <h2 id={ids.consultas} className={estilos.painelTitulo}>Suas próximas consultas</h2>
                <div className={estilos.painelAcao}>
                  <LinkSeta para="/consultas" pequeno>Ver todas</LinkSeta>
                </div>
              </header>

              <ListaAgendamentos agendamentos={agendamentos} aoAgendar={abrirAgendamento} />
            </section>

            {/* Segurança de dados */}
            <section className={estilos.faixaSeguranca} aria-labelledby={ids.seguranca}>
              <Icone nome="escudo" className={estilos.faixaIcone} />
              <div className={estilos.faixaCorpo}>
                <h2 id={ids.seguranca} className={estilos.faixaTitulo}>Seus dados estão seguros!</h2>
                <p className={estilos.faixaTexto}>Seguimos todas as normas de privacidade e proteção de dados.</p>
              </div>
              <LinkSeta href="#" pequeno className={estilos.faixaLink}>Saiba mais</LinkSeta>
              <svg className={estilos.faixaSelo} viewBox="0 0 40 44" aria-hidden="true">
                <defs>
                  <linearGradient id={ids.gradienteEscudo} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#6FB0FF" />
                    <stop offset="1" stopColor="#2E86FF" />
                  </linearGradient>
                </defs>
                <path d="M20 2 4 8v11c0 11 7 19.5 16 23 9-3.5 16-12 16-23V8z" fill={`url(#${ids.gradienteEscudo})`} />
                <path d="m12.5 22 5 5 10-10.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </section>
          </main>

          {/*
              PAINEL DIREITO
              */}
          <aside className={estilos.painelDireito} aria-label="Ações e informações">
            {/* ---- Agende sua consulta ---- */}
            <section className={classes(estilos.agendar, estilos.linhaInteira)} aria-labelledby={ids.agendar}>
              <Icone nome="calendario" className={estilos.agendarIcone} />
              <h2 id={ids.agendar} className={estilos.agendarTitulo}>Agende sua consulta</h2>
              <p className={estilos.agendarTexto}>
                Escolha a especialidade, o profissional e o melhor horário para você.
              </p>
              <button type="button" className={estilos.botaoAgendar} onClick={abrirAgendamento}>
                Agendar agora
                <Icone nome="seta" className={estilos.botaoAgendarIcone} />
              </button>
              <Icone nome="calendarioMais" className={estilos.agendarArte} />
            </section>

            {/*  Acesso rápido  */}
            <section className={estilos.painel} aria-labelledby={ids.acessoRapido}>
              <header className={estilos.painelCabecalho}>
                <Icone nome="raio" preenchido className={estilos.painelIcone} />
                <h2 id={ids.acessoRapido} className={estilos.painelTitulo}>Acesso rápido</h2>
              </header>
              <ul className={estilos.acessoLista}>
                {ACESSO_RAPIDO.map((item) => {
                  const conteudo = (
                    <>
                      <Icone nome={item.icone} className={estilos.acessoIcone} />
                      <span className={estilos.acessoRotulo}>{item.rotulo}</span>
                      <Icone nome="setaDireita" className={estilos.acessoSeta} />
                    </>
                  );

                  return (
                    <li key={item.rotulo}>
                      {item.para ? (
                        <Link to={item.para} className={estilos.acessoLink}>{conteudo}</Link>
                      ) : (
                        <a href="#" className={estilos.acessoLink}>{conteudo}</a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            {/*  Informações da sua unidade  */}
            <section className={estilos.painel} aria-labelledby={ids.unidade}>
              <header className={estilos.painelCabecalho}>
                <Icone nome="predio" className={estilos.painelIcone} />
                <h2 id={ids.unidade} className={estilos.painelTitulo}>Informações da sua unidade</h2>
              </header>

              <div className={estilos.unidade}>
                <div className={estilos.unidadeMapa} aria-hidden="true">
                  <svg viewBox="0 0 60 128" preserveAspectRatio="xMidYMid slice">
                    <rect width="60" height="128" fill="#E3EEFF" />
                    <path d="M-10 70 70 20M-10 110 70 60M10 -10 50 140M-10 30 70 100" stroke="#fff" strokeWidth="6" />
                    <path d="M-10 90 70 40" stroke="#fff" strokeWidth="3" />
                    <path d="M30 16c-6 0-10.5 4.4-10.5 10 0 7.5 10.5 17 10.5 17s10.5-9.5 10.5-17c0-5.6-4.5-10-10.5-10z" fill="#0066FF" />
                    <circle cx="30" cy="26.5" r="3.8" fill="#fff" />
                  </svg>
                </div>

                {unidade ? (
                <div className={estilos.unidadeInfo}>
                  <span className={estilos.unidadeNome}>{unidade.name}</span>
                  <address className={estilos.unidadeDetalhes}>
                    <span className={estilos.meta}>
                      <Icone nome="pino" className={estilos.metaIcone} />
                      <span>{unidade.address}</span>
                    </span>
                    {unidade.phone && (
                      <span className={estilos.meta}>
                        <Icone nome="telefone" className={estilos.metaIcone} />
                        <a href={paraLinkTelefone(unidade.phone)}>{unidade.phone}</a>
                      </span>
                    )}
                    <span className={estilos.meta}>
                      <Icone nome="relogio" className={estilos.metaIcone} />
                      <span>{unidade.hours}</span>
                    </span>
                  </address>
                  <LinkSeta href={unidade.mapUrl} pequeno className={estilos.unidadeLink}>
                    Ver no mapa
                  </LinkSeta>
                </div>
                ) : (
                  <div className={estilos.unidadeInfo}>
                    <span className={estilos.unidadeNome}>Nenhuma consulta marcada</span>
                    <span className={estilos.meta}>A unidade da sua próxima consulta aparece aqui.</span>
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <ModalAgendamento
        aberto={modalAberto}
        aoFechar={fecharAgendamento}
        aoConfirmar={confirmarAgendamento}
      />
    </div>
  );
}
