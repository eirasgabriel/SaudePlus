import { useId, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import MenuPerfil from './MenuPerfil/MenuPerfil.jsx';
import { useTema } from '../tema/contextoDoTema.js';
import { ocupadosDe } from '../features/paciente/adaptadores.js';
import { itemDoTema } from '../tema/itemDoTema.js';
import { useAuth } from '../features/auth/auth.context.js';
import ListaAgendamentos from './ListaAgendamentos';
import ModalAgendamento from './ModalAgendamento';
import WelcomeBanner from '../features/medico/components/WelcomeBanner/WelcomeBanner.jsx';
import UnitCard from '../features/medico/components/UnitCard/UnitCard.jsx';
import {
  mockAppointments,
  mockPatient,
} from '../services/dadosficticios';
import estilos from './PacienteDashboard.module.css';

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
  { rotulo: 'Falar com a clínica', icone: 'conversa', para: '/paciente/clinicas' },
];

const NOTIFICACOES_EXEMPLO = [
  {
    id: 'not-1',
    icone: 'calendario',
    titulo: 'Consulta confirmada',
    texto: 'Ginecologia com Dra. Ana Souza, dia 28 de setembro às 14:30.',
    quando: 'há 2 horas',
    lida: false,
    para: '/paciente/consultas',
  },
  {
    id: 'not-2',
    icone: 'frasco',
    titulo: 'Resultado de exame disponível',
    texto: 'O hemograma completo do dia 10 de setembro já pode ser baixado.',
    quando: 'ontem',
    lida: false,
    para: '/paciente/exames',
  },
  {
    id: 'not-3',
    icone: 'predio',
    titulo: 'Mudança no horário da unidade',
    texto: 'A Clínica da Família – Centro passa a fechar às 17h nas sextas.',
    quando: 'há 3 dias',
    lida: true,
    para: '/paciente/clinicas',
  },
];

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const contem = (alvo, termo) => normalizar(alvo).includes(termo);

const classes = (...lista) => lista.filter(Boolean).join(' ');

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
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
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

  if (!item.para) {
    return <a href="#" className={className}>{conteudo(false)}</a>;
  }

  return (
    <NavLink to={item.para} end={item.para === '/paciente'} className={className}>
      {({ isActive }) => conteudo(isActive)}
    </NavLink>
  );
}

export default function PacienteDashboard({
  paciente = mockPatient,
  consultas = mockAppointments,
  notificacoes = NOTIFICACOES_EXEMPLO,
  unidade,
  imagemBoasVindas,
  rotaAgendamento = '/paciente/consultas',
  aoAgendar,
  onConfirmar: aoConfirmarAgendamento,
  aoAbrirPerfil,
  aoPesquisar,
  conteudo,
  carregandoUnidade = false,
  avisoUnidade = null,
}) {
  const navegar = useNavigate();
  const prefixoId = `pd-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const ids = {
    boasVindas: `${prefixoId}-boas-vindas`,
    consultas: `${prefixoId}-consultas`,
    agendar: `${prefixoId}-agendar`,
    acessoRapido: `${prefixoId}-acesso-rapido`,
    unidade: `${prefixoId}-unidade`,
    busca: `${prefixoId}-busca`,
    notificacoes: `${prefixoId}-notificacoes`,
  };

  const { name: nomePaciente, role: perfilPaciente, avatarUrl: fotoPaciente } = paciente;

  const [contaAberta, setContaAberta] = useState(false);
  const botaoConta = useRef(null);
  const refNotificacoes = useRef(null);
  const idMenuConta = `${prefixoId}-menu-conta`;

  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [painelNotificacoes, setPainelNotificacoes] = useState(false);
  // Lidas nesta visita ("Marcar todas como lidas"); as já lidas vêm marcadas da API.
  const [lidas, setLidas] = useState([]);
  const estaLida = (n) => n.lida || lidas.includes(n.id);

  const { sair } = useAuth();

  const naoLidas = notificacoes.filter((n) => !estaLida(n)).length;
  const totalNotificacoes = naoLidas;
  const rotuloContador = totalNotificacoes > 9 ? '9+' : totalNotificacoes;

  function marcarTodasComoLidas() {
    setLidas(notificacoes.map((n) => n.id));
  }

  function alternarNotificacoes() {
    setPainelNotificacoes((aberto) => !aberto);
  }

  function fecharBusca() {
    setBuscaAberta(false);
    setTermoBusca('');
  }

  const { tema, alternarTema } = useTema();
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
    itemDoTema(tema, alternarTema),
    {
      rotulo: 'Sair',
      href: '/login',
      separado: true,
      destaque: true,
      onSelecionar: (evento) => {
        evento.preventDefault();
        sair();
        navegar('/login', { replace: true });
      },
    },
  ];

  const [modalAberto, setModalAberto] = useState(false);

  function abrirAgendamento() {
    if (aoAgendar) {
      aoAgendar();
      return;
    }
    setModalAberto(true);
  }

  const fecharAgendamento = () => setModalAberto(false);

  const confirmarAgendamento = (dados) => {
    if (aoConfirmarAgendamento) {
      return aoConfirmarAgendamento(dados);
    }
    navegar(rotaAgendamento, { state: { agendamento: dados } });
  };

  const termoNormalizado = normalizar(termoBusca);
  const filtrando = termoNormalizado.length > 0;

  const consultasFiltradas = filtrando
    ? consultas.filter(
        (c) =>
          contem(c.especialidade, termoNormalizado) ||
          contem(c.medico, termoNormalizado) ||
          contem(c.unidade, termoNormalizado)
      )
    : consultas;

  const cardsFiltrados = filtrando
    ? CARDS_ATALHO.filter(
        (card) =>
          contem(card.titulo, termoNormalizado) || contem(card.descricao, termoNormalizado)
      )
    : CARDS_ATALHO;

  const atalhosFiltrados = filtrando
    ? ACESSO_RAPIDO.filter((item) => contem(item.rotulo, termoNormalizado))
    : ACESSO_RAPIDO;

  const totalResultados = consultasFiltradas.length + cardsFiltrados.length + atalhosFiltrados.length;


  return (
    <div className={estilos.pagina}>
      <div className={estilos.app}>
        {/* Cabeçalho */}
        <header className={estilos.cabecalho}>
          <Link to="/paciente" className={estilos.marca} aria-label="SaúdePlus, página inicial">
            <span className={estilos.nomeMarca}>
              Saúde<span>Plus</span>
            </span>
            <span className={estilos.slogan}>A sua saúde, sempre andando junto com você!</span>
          </Link>

          <nav
            className={classes(estilos.menuTopo, buscaAberta && estilos.menuTopoOculto)}
            aria-label="Navegação principal"
          >
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

            <div className={estilos.notificacoes} ref={refNotificacoes}>
              <button
                type="button"
                className={estilos.botaoIcone}
                aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}
                aria-haspopup="true"
                aria-expanded={painelNotificacoes}
                aria-controls={ids.notificacoes}
                onClick={alternarNotificacoes}
              >
                <Icone nome="sino" />
                {naoLidas > 0 && (
                  <span className={estilos.contador} aria-hidden="true">{rotuloContador}</span>
                )}
              </button>

              {painelNotificacoes && (
                <div className={estilos.painelNotificacoes} id={ids.notificacoes} role="dialog" aria-label="Notificações">
                  <header className={estilos.painelCabecalhoNot}>
                    <h2 className={estilos.painelTituloNot}>Notificações</h2>
                    {naoLidas > 0 && (
                      <button type="button" className={estilos.marcarLidas} onClick={marcarTodasComoLidas}>
                        Marcar todas como lidas
                      </button>
                    )}
                  </header>

                  {notificacoes.length > 0 ? (
                    <ul className={estilos.listaNotificacoes}>
                      {notificacoes.map((item) => {
                        const naoLida = !estaLida(item);
                        const conteudo = (
                          <>
                            <span className={estilos.notIcone} aria-hidden="true">
                              <Icone nome={item.icone} />
                            </span>
                            <span className={estilos.notTexto}>
                              <span className={estilos.notTitulo}>
                                {item.titulo}
                                {naoLida && <span className={estilos.notPonto} aria-hidden="true" />}
                              </span>
                              <span className={estilos.notResumo}>{item.texto}</span>
                              <span className={estilos.notQuando}>{item.quando}</span>
                            </span>
                            {naoLida && <span className={estilos.somenteLeitor}>Não lida</span>}
                          </>
                        );

                        return (
                          <li key={item.id}>
                            {item.para ? (
                              <Link
                                to={item.para}
                                className={classes(estilos.notItem, naoLida && estilos.notItemNaoLida)}
                                onClick={() => setPainelNotificacoes(false)}
                              >
                                {conteudo}
                              </Link>
                            ) : (
                              <div className={classes(estilos.notItem, naoLida && estilos.notItemNaoLida)}>
                                {conteudo}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className={estilos.notVazio}>Você não tem notificações no momento.</p>
                  )}
                </div>
              )}
            </div>

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
          {/* Menu lateral */}
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

            {/* Mensagem no pé do menu, no mesmo formato do painel do médico. */}
            <div className={estilos.cardCuidado}>
              <Icone nome="coracao" className={estilos.iconeCuidado} />
              <p className={estilos.textoCuidado}>Cuidar de você é a nossa prioridade!</p>
            </div>
          </aside>

          {/* Conteúdo central: consultas e exames abrem aqui dentro (`conteudo`). */}
          <main id="conteudo" tabIndex={-1} className={estilos.conteudo}>
            {conteudo ?? <>
            {/* Boas-vindas: a mesma faixa do painel do médico. */}
            <WelcomeBanner
              nome={nomePaciente}
              subtitulo="Aqui está um resumo dos seus cuidados."
              imagem={imagemBoasVindas ?? null}
              tituloId={ids.boasVindas}
            />

            {filtrando && (
              <div className={estilos.faixaBusca} role="status">
                <span>
                  {totalResultados === 0
                    ? `Nada encontrado para “${termoBusca}”.`
                    : `${totalResultados} ${totalResultados === 1 ? 'resultado' : 'resultados'} para “${termoBusca}”.`}
                </span>
                <button type="button" className={estilos.limparFaixa} onClick={fecharBusca}>
                  Limpar busca
                </button>
              </div>
            )}

            {/* Cards de atalho */}
            {cardsFiltrados.length > 0 && (
              <section className={estilos.gradeAtalhos} aria-label="Atalhos do painel">
                {cardsFiltrados.map((card) => (
                  <article key={card.titulo} className={classes(estilos.cardAtalho, estilos[card.tom])}>
                    <span className={estilos.iconeAtalho} aria-hidden="true">
                      <Icone nome={card.icone} />
                    </span>
                    <h2 className={estilos.tituloAtalho}>{card.titulo}</h2>
                    <p className={estilos.descricaoAtalho}>{card.descricao}</p>
                    {/* O cartão inteiro é clicável (::after), como os do médico. */}
                    <Link
                      to={card.para}
                      className={estilos.linkAtalho}
                      aria-label={`${card.titulo}: ${card.rotuloLink}`}
                    >
                      <Icone nome="seta" />
                    </Link>
                  </article>
                ))}
              </section>
            )}

            {/* Suas próximas consultas */}
            {(!filtrando || consultasFiltradas.length > 0) && (
              <section className={estilos.painel} aria-labelledby={ids.consultas}>
                <header className={estilos.painelCabecalho}>
                  <Icone nome="calendario" className={estilos.painelIcone} />
                  <h2 id={ids.consultas} className={estilos.painelTitulo}>Suas próximas consultas</h2>
                  <div className={estilos.painelAcao}>
                    <LinkSeta para="/paciente/consultas" pequeno>Ver todas</LinkSeta>
                  </div>
                </header>

                <ListaAgendamentos agendamentos={consultasFiltradas} aoAgendar={abrirAgendamento} />
              </section>
            )}

            </>}
          </main>

          {/* Painel direito */}
          <aside className={estilos.painelDireito} aria-label="Ações e informações">
            {/* Agende sua consulta */}
            <section className={classes(estilos.agendar, estilos.linhaInteira)} aria-labelledby={ids.agendar}>
              <div className={estilos.agendarCabecalho}>
                <span className={estilos.agendarIcone} aria-hidden="true">
                  <Icone nome="calendario" />
                </span>
                <h2 id={ids.agendar} className={estilos.agendarTitulo}>Agende sua consulta</h2>
              </div>
              <p className={estilos.agendarTexto}>
                Escolha a especialidade, o profissional e o melhor horário para você.
              </p>
              <button type="button" className={estilos.botaoAgendar} onClick={abrirAgendamento}>
                Agendar agora
                <Icone nome="seta" className={estilos.botaoAgendarIcone} />
              </button>
            </section>

            {/* Unidade da próxima consulta: o mesmo cartão do painel do médico. */}
            <section className={estilos.painel} aria-labelledby={ids.unidade}>
              <header className={estilos.painelCabecalho}>
                <Icone nome="predio" className={estilos.painelIcone} />
                <h2 id={ids.unidade} className={estilos.painelTitulo}>Informações da sua unidade</h2>
              </header>

              {avisoUnidade ? (
                <p className={estilos.unidadeVazia}>{avisoUnidade}</p>
              ) : carregandoUnidade ? (
                <p className={estilos.unidadeVazia} role="status">Carregando informações da unidade…</p>
              ) : unidade ? (
                <UnitCard
                  unidade={{
                    nome: unidade.name,
                    endereco: unidade.address,
                    telefone: unidade.phone,
                    horario: unidade.hours,
                    mapUrl: unidade.mapUrl,
                  }}
                />
              ) : (
                <div className={estilos.unidadeVazia}>
                  <span className={estilos.unidadeNome}>Nenhuma consulta marcada</span>
                  <span className={estilos.meta}>A unidade da sua próxima consulta aparece aqui.</span>
                </div>
              )}
            </section>

            {/* Acesso rápido */}
            {atalhosFiltrados.length > 0 && (
              <section className={estilos.painel} aria-labelledby={ids.acessoRapido}>
                <header className={estilos.painelCabecalho}>
                  <Icone nome="raio" preenchido className={estilos.painelIcone} />
                  <h2 id={ids.acessoRapido} className={estilos.painelTitulo}>Acesso rápido</h2>
                </header>
                <ul className={estilos.acessoLista}>
                  {atalhosFiltrados.map((item) => {
                    const conteudoDoAtalho = (
                      <>
                        <Icone nome={item.icone} className={estilos.acessoIcone} />
                        <span className={estilos.acessoRotulo}>{item.rotulo}</span>
                        <Icone nome="setaDireita" className={estilos.acessoSeta} />
                      </>
                    );

                    return (
                      <li key={item.rotulo}>
                        {item.para ? (
                          <Link to={item.para} className={estilos.acessoLink}>{conteudoDoAtalho}</Link>
                        ) : (
                          <a href="#" className={estilos.acessoLink}>{conteudoDoAtalho}</a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>

      <ModalAgendamento
        aberto={modalAberto}
        aoFechar={fecharAgendamento}
        aoConfirmar={confirmarAgendamento}
        ocupados={ocupadosDe(consultas)}
      />
    </div>
  );
}