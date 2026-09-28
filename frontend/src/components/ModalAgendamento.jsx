import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { mockSpecialties } from '../services/dadosficticios';
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

export default function ModalAgendamento({
  aberto,
  aoFechar,
  aoConfirmar,
  especialidades = mockSpecialties,
  agendamentosExistentes = [],
  titulo = 'Agendar consulta',
  descricao = 'Escolha a especialidade, o profissional e o melhor horário para você.',
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

  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  const refDialogo = useRef(null);
  const refPrimeiroCampo = useRef(null);
  const refFocoAnterior = useRef(null);

  const especialidade = useMemo(
    () => especialidades.find((item) => item.id === formulario.especialidadeId) ?? null,
    [especialidades, formulario.especialidadeId],
  );

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

  useEffect(() => {
    if (!aberto) return undefined;

    refFocoAnterior.current = document.activeElement;
    setFormulario(FORMULARIO_VAZIO);
    setErros({});
    setEnviando(false);

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

      if (campo === 'especialidadeId') {
        atualizado.profissionalId = '';
        atualizado.data = '';
        atualizado.horario = '';
      }

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

    setErros((anterior) => ({ ...anterior, [campo]: undefined, horario: undefined }));
  }

  function validar() {
    const novosErros = {};

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
          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={ids.especialidade}>Especialidade</label>
            <select
              id={ids.especialidade}
              ref={refPrimeiroCampo}
              className={classes(estilos.select, erros.especialidadeId && estilos.campoInvalido)}
              value={formulario.especialidadeId}
              onChange={(evento) => alterarCampo('especialidadeId', evento.target.value)}
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
              disabled={!especialidade}
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

          {erros.envio && <p className={estilos.erroEnvio}>{erros.envio}</p>}

          <div className={estilos.acoes}>
            <button type="button" className={estilos.botaoSecundario} onClick={aoFechar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className={estilos.botaoPrimario} disabled={enviando}>
              {enviando ? 'Confirmando…' : 'Confirmar agendamento'}
              {!enviando && <IconeSeta className={estilos.iconeBotao} />}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}