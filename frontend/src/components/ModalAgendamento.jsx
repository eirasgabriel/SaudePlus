import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOpcoesDeAgendamento } from '../features/paciente/useOpcoesDeAgendamento';
import estilos from './ModalAgendamento.module.css';

const classes = (...lista) => lista.filter(Boolean).join(' ');

const doisDigitos = (numero) => String(numero).padStart(2, '0');
const montarISO = (ano, mes, dia) => `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
const isoDoDate = (date) => montarISO(date.getFullYear(), date.getMonth() + 1, date.getDate());

// Tudo que envolve data aqui é montado a partir dos componentes locais (ano, mês, dia).
const hojeISO = () => isoDoDate(new Date());

function dataLocal(iso, horario = '00:00') {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const [hora, minuto] = horario.split(':').map(Number);
  return new Date(ano, mes - 1, dia, hora, minuto, 0, 0);
}

function limiteISO(dias = 90) {
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  return isoDoDate(limite);
}

const formatoExtenso = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const formatoSemanaCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const formatoDia = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' });
const formatoMesCurto = new Intl.DateTimeFormat('pt-BR', { month: 'short' });

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const semPonto = (texto) => texto.replace(/\./g, '');

const descreverData = (iso) => capitalizar(formatoExtenso.format(dataLocal(iso)));

function rotuloChip(iso) {
  const data = dataLocal(iso);
  const semana = capitalizar(semPonto(formatoSemanaCurto.format(data)));
  return `${semana} ${formatoDia.format(data)} ${semPonto(formatoMesCurto.format(data))}`;
}

const DIAS_NO_PLURAL = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados'];

function descreverDiasDeAtendimento(profissional) {
  if (!profissional) return '';

  const nomes = Object.keys(profissional.schedule)
    .map(Number)
    .sort((a, b) => a - b)
    .map((dia) => DIAS_NO_PLURAL[dia]);

  if (nomes.length === 1) return nomes[0];
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

function horariosOcupados(agendamentos, profissional, iso) {
  if (!profissional || !iso) return [];

  return agendamentos
    .filter((item) => {
      const quando = String(item.dateTime);
      return item.professional === profissional.name && quando.slice(0, 10) === iso;
    })
    .map((item) => String(item.dateTime).slice(11, 16));
}

function horariosLivres(profissional, iso, agendamentos) {
  if (!profissional || !iso) return [];

  const daAgenda = profissional.schedule[dataLocal(iso).getDay()] ?? [];
  const ocupados = horariosOcupados(agendamentos, profissional, iso);
  const agora = new Date();
  const ehHoje = iso === hojeISO();

  return daAgenda.filter((horario) => {
    if (ocupados.includes(horario)) return false;
    if (ehHoje && dataLocal(iso, horario) <= agora) return false;
    return true;
  });
}

function proximasDatasLivres(profissional, agendamentos, quantidade = 4) {
  if (!profissional) return [];

  const datas = [];
  const cursor = new Date();
  const maximoDeDias = 90;

  for (let i = 0; i <= maximoDeDias && datas.length < quantidade; i += 1) {
    const iso = isoDoDate(cursor);
    if (horariosLivres(profissional, iso, agendamentos).length > 0) datas.push(iso);
    cursor.setDate(cursor.getDate() + 1);
  }

  return datas;
}

const FORMULARIO_VAZIO = {
  especialidadeId: '',
  profissionalId: '',
  data: '',
  horario: '',
};

const SELETOR_FOCAVEIS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
    <path d="M8 2.5v4M16 2.5v4M3 9.5h18M12 12.5v6M9 15.5h6" />
  </svg>
);

const IconeFechar = ({ className }) => (
  <svg {...propsSvg} className={className} strokeWidth="2.2">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const IconeSeta = ({ className }) => (
  <svg {...propsSvg} className={className} strokeWidth="2.2">
    <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5" />
  </svg>
);

const IconeCheck = ({ className }) => (
  <svg {...propsSvg} className={className} strokeWidth="2.2">
    <path d="M4.5 12.5l5 5 10-11" />
  </svg>
);

<<<<<<< HEAD
/**
 * Modal de agendamento de consulta.
 *
 * <ModalAgendamento
 *   aberto={modalAberto}
 *   aoFechar={() => setModalAberto(false)}
 *   aoConfirmar={(dados) => api.agendar(dados)}
 * />
 *
 * As opções vêm da API (especialidades, médicos da especialidade e horários
 * livres do médico na data); sem API, caem nas opções fixas de demonstração.
 *
 * `aoConfirmar` recebe
 * { especialidade, profissional, data, horario, modalidade, especialidadeId, profissionalId }
 * e pode devolver uma promessa: o modal espera, e se ela falhar mostra a
 * mensagem e continua aberto (horário tomado por outra pessoa, por exemplo).
 *
 * `fixo` ({ especialidadeId, especialidade, profissionalId, profissional })
 * trava especialidade e médico — é o modo de remarcar uma consulta.
 *
 * `inicial` ({ especialidadeId, profissionalId, data?, horario? }) só
 * preenche o formulário ao abrir; tudo continua editável. É o que o
 * "Agendar consulta" do perfil e da busca usa. Um horário pré-escolhido que
 * não esteja entre os livres não é enviado.
 *
 * Renderizado em portal no <body>, então funciona a partir de qualquer
 * lugar da árvore sem depender do overflow ou do z-index da tela.
 */
=======
>>>>>>> feature/dashboard-paciente
export default function ModalAgendamento({
  aberto,
  aoFechar,
  aoConfirmar,
<<<<<<< HEAD
  fixo = null,
  inicial = null,
  titulo = fixo ? 'Remarcar consulta' : 'Agendar consulta',
  descricao = fixo
    ? 'Escolha uma nova data e um horário livre com o mesmo profissional.'
    : 'Escolha a especialidade, o profissional e o melhor horário para você.',
  rotuloConfirmar = fixo ? 'Confirmar nova data' : 'Confirmar agendamento',
=======
  especialidades = mockSpecialties,
  agendamentosExistentes = [],
  titulo = 'Agendar consulta',
  descricao = 'Escolha a especialidade, o profissional e o melhor horário para você.',
>>>>>>> feature/dashboard-paciente
}) {
  const prefixoId = `ma-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const ids = {
    titulo: `${prefixoId}-titulo`,
    descricao: `${prefixoId}-descricao`,
    especialidade: `${prefixoId}-especialidade`,
    profissional: `${prefixoId}-profissional`,
    data: `${prefixoId}-data`,
    horario: `${prefixoId}-horario`,
  };

  const formularioInicial = fixo
    ? { ...FORMULARIO_VAZIO, especialidadeId: fixo.especialidadeId, profissionalId: fixo.profissionalId }
    : inicial
      ? {
          especialidadeId: inicial.especialidadeId ?? '',
          profissionalId: inicial.profissionalId ?? '',
          data: inicial.data ?? '',
          horario: inicial.horario ?? '',
        }
      : FORMULARIO_VAZIO;
  const [formulario, setFormulario] = useState(formularioInicial);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
<<<<<<< HEAD
  const [erroGeral, setErroGeral] = useState(null);
  // Sobe depois de um 409, para buscar de novo os horários livres.
  const [versaoHorarios, setVersaoHorarios] = useState(0);
=======
>>>>>>> feature/dashboard-paciente

  const refDialogo = useRef(null);
  const refPrimeiroCampo = useRef(null);
  const refFocoAnterior = useRef(null);

<<<<<<< HEAD
  const opcoes = useOpcoesDeAgendamento({
    aberto,
    especialidadeId: formulario.especialidadeId,
    profissionalId: formulario.profissionalId,
    data: formulario.data,
    versao: versaoHorarios,
  });
  // Sem a lista de especialidades da API, o modal mostra o erro (sem opções de demonstração).
  const semCatalogo = !fixo && opcoes.origem === 'erro';

  const especialidades = useMemo(
    () => (fixo ? [{ id: fixo.especialidadeId, name: fixo.especialidade }] : opcoes.especialidades),
    [fixo, opcoes.especialidades],
=======
  const especialidade = useMemo(
    () => especialidades.find((item) => item.id === formulario.especialidadeId) ?? null,
    [especialidades, formulario.especialidadeId],
>>>>>>> feature/dashboard-paciente
  );
  const especialidadeEscolhida = especialidades.find((item) => item.id === formulario.especialidadeId) ?? null;
  const profissionais = fixo ? [{ id: fixo.profissionalId, name: fixo.profissional }] : opcoes.profissionais;
  const horarios = opcoes.horarios;
  // Os horários dependem do médico e da data.
  const podeVerHorarios = Boolean(formulario.profissionalId && formulario.data);

<<<<<<< HEAD
  /* ---- Ao abrir: limpa o formulário ----
     Feito durante o render (padrão "ajustar estado quando uma prop muda" da
     documentação do React) em vez de setState dentro do efeito. */
  const [abertoAnterior, setAbertoAnterior] = useState(aberto);
  if (aberto !== abertoAnterior) {
    setAbertoAnterior(aberto);
    if (aberto) {
      setFormulario(formularioInicial);
      setErros({});
      setErroGeral(null);
      setEnviando(false);
    }
  }

  /* ---- Ao abrir: leva o foco para o 1º campo e trava a rolagem ---- */
=======
  const profissionais = especialidade?.professionals ?? [];

  const profissional = useMemo(
    () => profissionais.find((item) => item.id === formulario.profissionalId) ?? null,
    [profissionais, formulario.profissionalId],
  );

  const datasSugeridas = useMemo(
    () => proximasDatasLivres(profissional, agendamentosExistentes),
    [profissional, agendamentosExistentes],
  );

  const horarios = useMemo(
    () => horariosLivres(profissional, formulario.data, agendamentosExistentes),
    [profissional, formulario.data, agendamentosExistentes],
  );

  const horariosDaManha = horarios.filter((horario) => Number(horario.slice(0, 2)) < 12);
  const horariosDaTarde = horarios.filter((horario) => Number(horario.slice(0, 2)) >= 12);

  const dataEhDiaDeAtendimento =
    Boolean(profissional) &&
    Boolean(formulario.data) &&
    Boolean(profissional.schedule[dataLocal(formulario.data).getDay()]);

>>>>>>> feature/dashboard-paciente
  useEffect(() => {
    if (!aberto) return undefined;

    refFocoAnterior.current = document.activeElement;
<<<<<<< HEAD
=======
    setFormulario(FORMULARIO_VAZIO);
    setErros({});
    setEnviando(false);
>>>>>>> feature/dashboard-paciente

    const foco = window.setTimeout(() => refPrimeiroCampo.current?.focus(), 0);

    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    const overflowAnterior = document.body.style.overflow;
    const paddingAnterior = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (larguraBarra > 0) document.body.style.paddingRight = `${larguraBarra}px`;

    return () => {
      window.clearTimeout(foco);
      document.body.style.overflow = overflowAnterior;
      document.body.style.paddingRight = paddingAnterior;
      refFocoAnterior.current?.focus?.();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return undefined;

    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        aoFechar?.();
        return;
      }

      if (evento.key !== 'Tab') return;

      const focaveis = refDialogo.current?.querySelectorAll(SELETOR_FOCAVEIS);
      if (!focaveis?.length) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  function alterarCampo(campo, valor) {
    setFormulario((anterior) => {
      const atualizado = { ...anterior, [campo]: valor };
<<<<<<< HEAD
      // Trocar a especialidade invalida profissional e horário;
      // trocar profissional ou data invalida o horário.
=======

>>>>>>> feature/dashboard-paciente
      if (campo === 'especialidadeId') {
        atualizado.profissionalId = '';
        atualizado.data = '';
        atualizado.horario = '';
      }
<<<<<<< HEAD
      if (campo === 'profissionalId' || campo === 'data') {
        atualizado.horario = '';
      }
      return atualizado;
    });
    setErros((anterior) => ({ ...anterior, [campo]: undefined }));
    setErroGeral(null);
  };
=======

      if (campo === 'profissionalId') {
        atualizado.data = '';
        atualizado.horario = '';
      }

      if (campo === 'data') {
        const aindaExiste = horariosLivres(profissional, valor, agendamentosExistentes)
          .includes(anterior.horario);
        if (!aindaExiste) atualizado.horario = '';
      }

      return atualizado;
    });
>>>>>>> feature/dashboard-paciente

    setErros((anterior) => ({ ...anterior, [campo]: undefined, horario: undefined }));
  }

  function validar() {
    const novosErros = {};
<<<<<<< HEAD
    if (!formulario.especialidadeId) novosErros.especialidadeId = 'Escolha uma especialidade.';
    if (!formulario.profissionalId) novosErros.profissionalId = 'Escolha um profissional.';
    if (!formulario.data) novosErros.data = 'Informe a data da consulta.';
    else if (formulario.data < hojeISO()) novosErros.data = 'Escolha uma data de hoje em diante.';
    if (!formulario.horario) novosErros.horario = 'Escolha um horário.';
    else if (opcoes.carregandoHorarios) novosErros.horario = 'Aguarde a lista de horários livres.';
    else if (!horarios.some((item) => item.horario === formulario.horario)) {
      novosErros.horario = 'Esse horário não está livre. Escolha outro.';
    }
    return novosErros;
  };

  const enviar = async (evento) => {
=======

    if (!formulario.especialidadeId) {
      novosErros.especialidadeId = 'Escolha uma especialidade.';
    }

    if (!formulario.profissionalId) {
      novosErros.profissionalId = 'Escolha um profissional.';
    }

    if (!formulario.data) {
      novosErros.data = 'Informe a data da consulta.';
    } else if (formulario.data < hojeISO()) {
      novosErros.data = 'Escolha uma data de hoje em diante.';
    } else if (formulario.data > limiteISO()) {
      novosErros.data = 'Só é possível agendar com até três meses de antecedência.';
    } else if (profissional && !dataEhDiaDeAtendimento) {
      novosErros.data = `${profissional.name} atende ${descreverDiasDeAtendimento(profissional)}.`;
    } else if (profissional && horarios.length === 0) {
      novosErros.data = 'Não há horário livre nesta data. Escolha outro dia.';
    }

    if (!formulario.horario) {
      novosErros.horario = 'Escolha um horário.';
    } else if (!horarios.includes(formulario.horario)) {
      novosErros.horario = 'Este horário não está mais disponível.';
    }

    return novosErros;
  }

  async function enviar(evento) {
>>>>>>> feature/dashboard-paciente
    evento.preventDefault();
    if (enviando) return;

    const novosErros = validar();

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);

      const ordem = ['especialidadeId', 'profissionalId', 'data', 'horario'];
      const mapa = {
        especialidadeId: ids.especialidade,
        profissionalId: ids.profissional,
        data: ids.data,
        horario: ids.horario,
      };
      const primeiroComErro = ordem.find((campo) => novosErros[campo]);
      document.getElementById(mapa[primeiroComErro])?.focus();
      return;
    }

<<<<<<< HEAD
    const profissional = profissionais.find((item) => item.id === formulario.profissionalId);
    const horarioEscolhido = horarios.find((item) => item.horario === formulario.horario);

    setEnviando(true);
    try {
      await aoConfirmar?.({
        especialidadeId: formulario.especialidadeId,
        especialidade: especialidadeEscolhida?.name ?? '',
        profissionalId: formulario.profissionalId,
        profissional: profissional?.name ?? '',
        data: formulario.data,
        horario: formulario.horario,
        modalidade: horarioEscolhido?.modalidade,
      });
      aoFechar?.();
    } catch (erro) {
      setErroGeral(erro?.message ?? 'Não foi possível concluir o agendamento.');
      if (erro?.status === 409) {
        // Alguém reservou antes: mostra os horários que sobraram.
        setFormulario((anterior) => ({ ...anterior, horario: '' }));
        setVersaoHorarios((versao) => versao + 1);
      }
    } finally {
      setEnviando(false);
    }
  };
=======
    const consulta = {
      id: `agd-${Date.now()}`,
      dateTime: `${formulario.data}T${formulario.horario}:00`,
      clinic: profissional.clinic,
      address: profissional.address,
      specialty: especialidade.name,
      professional: profissional.name,
      status: 'confirmada',
      specialtyId: especialidade.id,
      professionalId: profissional.id,
    };

    try {
      setEnviando(true);
      await aoConfirmar?.(consulta);
      aoFechar?.();
    } catch (erro) {
      setEnviando(false);
      setErros({ envio: 'Não foi possível concluir o agendamento. Tente novamente.' });
    }
  }

  const resumoPronto = Boolean(formulario.data && formulario.horario);
  const doisPeriodos = horariosDaManha.length > 0 && horariosDaTarde.length > 0;
>>>>>>> feature/dashboard-paciente

  function listaDeHorarios(lista, rotulo) {
    if (lista.length === 0) return null;

    return (
      <div className={estilos.periodo}>
        {doisPeriodos && <span className={estilos.periodoRotulo}>{rotulo}</span>}
        <div className={estilos.horarios}>
          {lista.map((horario) => {
            const selecionado = formulario.horario === horario;
            return (
              <button
                key={horario}
                type="button"
                className={classes(estilos.horario, selecionado && estilos.horarioAtivo)}
                onClick={() => alterarCampo('horario', horario)}
                aria-pressed={selecionado}
              >
                {horario}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return createPortal(
    <div
      className={estilos.fundo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar?.();
      }}
    >
      <div
        className={estilos.dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ids.titulo}
        aria-describedby={ids.descricao}
        ref={refDialogo}
      >
        <header className={estilos.cabecalho}>
          <span className={estilos.iconeCabecalho} aria-hidden="true">
            <IconeCalendario />
          </span>
          <div className={estilos.textoCabecalho}>
            <h2 id={ids.titulo} className={estilos.titulo}>{titulo}</h2>
            <p id={ids.descricao} className={estilos.descricao}>{descricao}</p>
          </div>
          <button type="button" className={estilos.botaoFechar} onClick={aoFechar} aria-label="Fechar">
            <IconeFechar />
          </button>
        </header>

        <form className={estilos.formulario} onSubmit={enviar} noValidate>
<<<<<<< HEAD
          {semCatalogo && (
            <div className={estilos.aviso} role="alert">
              Não foi possível carregar as especialidades. Verifique a conexão e{' '}
              <button type="button" className={estilos.botaoTentar} onClick={opcoes.tentarDeNovo}>
                tente de novo
              </button>
              .
            </div>
          )}
          {/* Especialidade */}
=======
>>>>>>> feature/dashboard-paciente
          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={ids.especialidade}>Especialidade</label>
            <select
              id={ids.especialidade}
              ref={refPrimeiroCampo}
              className={classes(estilos.select, erros.especialidadeId && estilos.campoInvalido)}
              value={formulario.especialidadeId}
              onChange={(evento) => alterarCampo('especialidadeId', evento.target.value)}
              disabled={Boolean(fixo)}
              aria-invalid={erros.especialidadeId ? 'true' : undefined}
              aria-describedby={erros.especialidadeId ? `${ids.especialidade}-erro` : undefined}
            >
              <option value="">Selecione a especialidade</option>
              {especialidades.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {erros.especialidadeId && (
              <p id={`${ids.especialidade}-erro`} className={estilos.erro}>{erros.especialidadeId}</p>
            )}
          </div>

          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={ids.profissional}>Médico / profissional</label>
            <select
              id={ids.profissional}
              className={classes(estilos.select, erros.profissionalId && estilos.campoInvalido)}
              value={formulario.profissionalId}
              onChange={(evento) => alterarCampo('profissionalId', evento.target.value)}
<<<<<<< HEAD
              disabled={Boolean(fixo) || !especialidadeEscolhida}
=======
              disabled={!especialidade}
>>>>>>> feature/dashboard-paciente
              aria-invalid={erros.profissionalId ? 'true' : undefined}
              aria-describedby={erros.profissionalId ? `${ids.profissional}-erro` : undefined}
            >
              <option value="">
                {especialidade ? 'Selecione o profissional' : 'Escolha a especialidade primeiro'}
              </option>
              {profissionais.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {profissional && (
              <p className={estilos.ajuda}>
                Atende {descreverDiasDeAtendimento(profissional)}, na unidade {profissional.clinic}.
              </p>
            )}
            {erros.profissionalId && (
              <p id={`${ids.profissional}-erro`} className={estilos.erro}>{erros.profissionalId}</p>
            )}
          </div>

          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={ids.data}>Data</label>

            {datasSugeridas.length > 0 && (
              <div className={estilos.datas}>
                {datasSugeridas.map((iso) => {
                  const selecionada = formulario.data === iso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={classes(estilos.data, selecionada && estilos.dataAtiva)}
                      onClick={() => alterarCampo('data', iso)}
                      aria-pressed={selecionada}
                    >
                      {rotuloChip(iso)}
                    </button>
                  );
                })}
              </div>
            )}

            <input
              id={ids.data}
              type="date"
              min={hojeISO()}
              max={limiteISO()}
              className={classes(estilos.input, erros.data && estilos.campoInvalido)}
              value={formulario.data}
              onChange={(evento) => alterarCampo('data', evento.target.value)}
              disabled={!profissional}
              aria-invalid={erros.data ? 'true' : undefined}
              aria-describedby={erros.data ? `${ids.data}-erro` : undefined}
            />

            {!profissional && <p className={estilos.ajuda}>Escolha o profissional para ver as datas livres.</p>}
            {erros.data && <p id={`${ids.data}-erro`} className={estilos.erro}>{erros.data}</p>}
          </div>

          <fieldset
            className={estilos.campo}
            aria-invalid={erros.horario ? 'true' : undefined}
            aria-describedby={erros.horario ? `${ids.horario}-erro` : undefined}
          >
            <legend className={estilos.rotulo}>Horário</legend>

<<<<<<< HEAD
            {!podeVerHorarios ? (
              <p className={estilos.aviso} id={ids.horario} tabIndex={-1}>
                Os horários livres aparecem depois que você escolhe o profissional e a data.
              </p>
            ) : opcoes.carregandoHorarios ? (
              <p className={estilos.aviso} id={ids.horario} tabIndex={-1} aria-live="polite">
                Buscando horários livres…
              </p>
            ) : horarios.length === 0 ? (
              <p className={estilos.aviso} id={ids.horario} tabIndex={-1} aria-live="polite">
                Nenhum horário livre nesse dia. Tente outra data.
              </p>
            ) : (
              <div className={estilos.horarios} id={ids.horario} tabIndex={-1}>
                {horarios.map(({ horario: hora }) => {
                  const selecionado = formulario.horario === hora;
                  return (
                    <button
                      key={hora}
                      type="button"
                      className={classes(estilos.horario, selecionado && estilos.horarioAtivo)}
                      onClick={() => alterarCampo('horario', hora)}
                      aria-pressed={selecionado}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>
            )}
=======
            <div id={ids.horario} tabIndex={-1} className={estilos.blocoHorarios}>
              {!profissional && <p className={estilos.aviso}>Os horários aparecem depois que você escolhe o profissional.</p>}

              {profissional && !formulario.data && (
                <p className={estilos.aviso}>Escolha uma data para ver os horários livres.</p>
              )}

              {profissional && formulario.data && horarios.length === 0 && (
                <p className={estilos.aviso}>
                  {dataEhDiaDeAtendimento
                    ? 'Todos os horários deste dia já foram preenchidos.'
                    : `${profissional.name} não atende neste dia.`}
                </p>
              )}

              {listaDeHorarios(horariosDaManha, 'Manhã')}
              {listaDeHorarios(horariosDaTarde, 'Tarde')}
            </div>
>>>>>>> feature/dashboard-paciente

            {erros.horario && <p id={`${ids.horario}-erro`} className={estilos.erro}>{erros.horario}</p>}
          </fieldset>

          {resumoPronto && (
            <p className={estilos.resumo}>
              <IconeCheck className={estilos.resumoIcone} />
              <span>
                Consulta para <strong>{descreverData(formulario.data)}</strong> às{' '}
                <strong>{formulario.horario}</strong>.
              </span>
            </p>
          )}

<<<<<<< HEAD
          {erroGeral && (
            <p className={estilos.erro} role="alert">{erroGeral}</p>
          )}

          {/* Ações */}
=======
          {erros.envio && <p className={estilos.erroEnvio}>{erros.envio}</p>}

>>>>>>> feature/dashboard-paciente
          <div className={estilos.acoes}>
            <button type="button" className={estilos.botaoSecundario} onClick={aoFechar} disabled={enviando}>
              Cancelar
            </button>
<<<<<<< HEAD
            <button type="submit" className={estilos.botaoPrimario} disabled={enviando} aria-busy={enviando}>
              {enviando ? 'Enviando…' : rotuloConfirmar}
              <IconeSeta className={estilos.iconeBotao} />
=======
            <button type="submit" className={estilos.botaoPrimario} disabled={enviando}>
              {enviando ? 'Confirmando…' : 'Confirmar agendamento'}
              {!enviando && <IconeSeta className={estilos.iconeBotao} />}
>>>>>>> feature/dashboard-paciente
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}