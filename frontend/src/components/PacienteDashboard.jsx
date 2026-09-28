import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ListaAgendamentos from './ListaAgendamentos';
import ModalAgendamento from './ModalAgendamento';
import {
  mockAppointments,
  mockNotificationCount,
  mockPatient,
} from '../services/dadosficticios';
import estilos from './PacienteDashboard.module.css';

// `para` é a rota do react-router-dom. Itens sem `para` ainda não têm rota e
// viram âncora inerte; quando a rota existir, basta preencher o campo.

const MENU_TOPO = [
  { rotulo: 'Início', icone: 'inicio', para: '/paciente' },
  { rotulo: 'Consultas', icone: 'calendario', para: '/paciente/consultas' },
  { rotulo: 'Exames', icone: 'frasco', para: '/paciente/exames' },
  { rotulo: 'Histórico', icone: 'arquivo', para: '/paciente/historico' },
  { rotulo: 'Clínicas', icone: 'hospital', para: '/paciente/clinicas' },
];

const MENU_LATERAL = [
  { rotulo: 'Visão geral', icone: 'inicio', para: '/paciente' },
  { rotulo: 'Minhas informações', icone: 'usuario', para: '/paciente/perfil' },
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
  { rotulo: 'Atualizar meus dados', icone: 'usuario', para: '/paciente/perfil' },
  { rotulo: 'Falar com a clínica', icone: 'conversa', para: '/paciente/clinicas' },
];

// Notificações de exemplo. Na integração troque pela prop `notificacoes`, que
// espera a mesma forma: id, icone, titulo, texto, quando e lida.
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

// Comparar sem acento e sem caixa faz "clinico" encontrar "Clínico Geral", que é
// como a paciente costuma digitar.
function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const contem = (alvo, termo) => normalizar(alvo).includes(termo);

/** Junta classes CSS ignorando valores falsy. */
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
    // `end` evita que a raiz do paciente fique ativa nas telas filhas
    <NavLink to={item.para} end={item.para === '/paciente'} className={className}>
      {({ isActive }) => conteudo(isActive)}
    </NavLink>
  );
}

/**
 * Dashboard do Paciente — SaúdePlus
 *
 * A lista de consultas é controlada pelo App.jsx, que também recebe a consulta
 * nova pelo `onConfirmar`. Sem essa prop o modal abre e valida normalmente, mas
 * o agendamento não tem onde ser guardado.
 *
 * <PacienteDashboard consultas={consultas} onConfirmar={handleAdicionarConsulta} />
 *
 * Precisa estar dentro de um <BrowserRouter> (ver src/App.jsx), porque usa
 * Link e NavLink do react-router-dom.
 *
 * `aoAgendar` continua disponível para quem quiser abrir outro modal no lugar deste.
 */
export default function PacienteDashboard({
  paciente = mockPatient,
  consultas = mockAppointments,
  notificacoes = NOTIFICACOES_EXEMPLO,
  imagemBoasVindas,
  aoAgendar,
  onConfirmar,
  aoAbrirPerfil,
}) {
  const prefixoId = `pd-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const ids = {
    boasVindas: `${prefixoId}-boas-vindas`,
    consultas: `${prefixoId}-consultas`,
    seguranca: `${prefixoId}-seguranca`,
    agendar: `${prefixoId}-agendar`,
    acessoRapido: `${prefixoId}-acesso-rapido`,
    gradienteFundo: `${prefixoId}-gradiente-fundo`,
    gradienteEscudo: `${prefixoId}-gradiente-escudo`,
    busca: `${prefixoId}-busca`,
    notificacoes: `${prefixoId}-notificacoes`,
  };

  const { name: nomePaciente, role: perfilPaciente, avatarUrl: fotoPaciente } = paciente;

  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [painelNotificacoes, setPainelNotificacoes] = useState(false);
  const [lidas, setLidas] = useState(() => notificacoes.filter((n) => n.lida).map((n) => n.id));

  const refBusca = useRef(null);
  const refCampoBusca = useRef(null);
  const refNotificacoes = useRef(null);

  const termo = normalizar(termoBusca);
  const filtrando = termo.length > 0;

  // O painel do sino e a busca ocupam o mesmo canto do cabeçalho, então deixar
  // os dois abertos ao mesmo tempo só atrapalharia.
  function abrirBusca() {
    setPainelNotificacoes(false);
    setBuscaAberta(true);
    window.setTimeout(() => refCampoBusca.current?.focus(), 0);
  }

  function fecharBusca() {
    setBuscaAberta(false);
    setTermoBusca('');
  }

  function alternarNotificacoes() {
    setBuscaAberta(false);
    setPainelNotificacoes((aberto) => !aberto);
  }

  // Clique fora e Esc fecham o que estiver aberto, como em qualquer menu suspenso.
  useEffect(() => {
    if (!buscaAberta && !painelNotificacoes) return undefined;

    function aoClicarFora(evento) {
      if (buscaAberta && !refBusca.current?.contains(evento.target)) fecharBusca();
      if (painelNotificacoes && !refNotificacoes.current?.contains(evento.target)) {
        setPainelNotificacoes(false);
      }
    }

    function aoTeclar(evento) {
      if (evento.key !== 'Escape') return;
      if (painelNotificacoes) setPainelNotificacoes(false);
      if (buscaAberta) fecharBusca();
    }

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [buscaAberta, painelNotificacoes]);

  const naoLidas = notificacoes.filter((item) => !lidas.includes(item.id)).length;
  const rotuloContador = naoLidas > 9 ? '9+' : naoLidas;

  function marcarTodasComoLidas() {
    setLidas(notificacoes.map((item) => item.id));
  }

  // A busca varre os textos que a paciente vê no cartão, não os ids internos.
  const cardsFiltrados = useMemo(() => {
    if (!filtrando) return CARDS_ATALHO;
    return CARDS_ATALHO.filter(
      (card) => contem(card.titulo, termo) || contem(card.descricao, termo),
    );
  }, [filtrando, termo]);

  const atalhosFiltrados = useMemo(() => {
    if (!filtrando) return ACESSO_RAPIDO;
    return ACESSO_RAPIDO.filter((item) => contem(item.rotulo, termo));
  }, [filtrando, termo]);

  const consultasFiltradas = useMemo(() => {
    if (!filtrando) return consultas;
    return consultas.filter(
      (consulta) =>
        contem(consulta.specialty, termo) ||
        contem(consulta.professional, termo) ||
        contem(consulta.clinic, termo) ||
        contem(consulta.address, termo),
    );
  }, [consultas, filtrando, termo]);

  const totalResultados =
    cardsFiltrados.length + atalhosFiltrados.length + consultasFiltradas.length;

  // O botão "Agendar agora" e o link "Agendar consulta" do estado vazio da lista
  // abrem o mesmo modal.
  const [modalAberto, setModalAberto] = useState(false);

  function abrirAgendamento() {
    // `aoAgendar` permite que a tela pai assuma o fluxo com outro modal ou outra rota.
    if (aoAgendar) {
      aoAgendar();
      return;
    }
    setModalAberto(true);
  }

  const fecharAgendamento = () => setModalAberto(false);

  // O modal espera esta função resolver antes de fechar, então um erro vindo da
  // API mantém o formulário aberto com o que a paciente já preencheu.
  async function confirmarAgendamento(novaConsulta) {
    await onConfirmar?.(novaConsulta);
  }

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
            <div className={estilos.busca} ref={refBusca}>
              {buscaAberta ? (
                <div className={estilos.campoBusca}>
                  <Icone nome="busca" className={estilos.campoBuscaIcone} />
                  <input
                    id={ids.busca}
                    ref={refCampoBusca}
                    type="search"
                    className={estilos.entradaBusca}
                    placeholder="Buscar consultas, exames, clínicas…"
                    value={termoBusca}
                    onChange={(evento) => setTermoBusca(evento.target.value)}
                    aria-label="Buscar no painel"
                  />
                  <button
                    type="button"
                    className={estilos.limparBusca}
                    onClick={fecharBusca}
                    aria-label="Fechar busca"
                  >
                    <Icone nome="fechar" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={estilos.botaoIcone}
                  aria-label="Pesquisar"
                  aria-expanded={false}
                  onClick={abrirBusca}
                >
                  <Icone nome="busca" />
                </button>
              )}
            </div>

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
                        const naoLida = !lidas.includes(item.id);
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
              className={estilos.perfil}
              aria-haspopup="menu"
              aria-label={`Menu da conta de ${nomePaciente}`}
              onClick={aoAbrirPerfil}
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

          {/* Conteúdo central */}
          <main className={estilos.conteudo}>
            {/* Boas-vindas */}
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
                    <LinkSeta para={card.para} className={estilos.linkAtalho}>
                      {card.rotuloLink}
                    </LinkSeta>
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

            {/* Segurança de dados */}
            {!filtrando && (
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
            )}
          </main>

          {/* Painel direito */}
          <aside className={estilos.painelDireito} aria-label="Ações e informações">
            {/* Agende sua consulta */}
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

            {/* Acesso rápido */}
            {atalhosFiltrados.length > 0 && (
              <section className={estilos.painel} aria-labelledby={ids.acessoRapido}>
                <header className={estilos.painelCabecalho}>
                  <Icone nome="raio" preenchido className={estilos.painelIcone} />
                  <h2 id={ids.acessoRapido} className={estilos.painelTitulo}>Acesso rápido</h2>
                </header>
                <ul className={estilos.acessoLista}>
                  {atalhosFiltrados.map((item) => {
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
            )}
          </aside>
        </div>
      </div>

      <ModalAgendamento
        aberto={modalAberto}
        aoFechar={fecharAgendamento}
        aoConfirmar={confirmarAgendamento}
        agendamentosExistentes={consultas}
      />
    </div>
  );
}
