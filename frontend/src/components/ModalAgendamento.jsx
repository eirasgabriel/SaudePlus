import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOpcoesDeAgendamento } from '../features/paciente/useOpcoesDeAgendamento';
import estilos from './ModalAgendamento.module.css';

const classes = (...lista) => lista.filter(Boolean).join(' ');

const doisDigitos = (numero) => String(numero).padStart(2, '0');
const montarISO = (ano, mes, dia) => `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
const isoDoDate = (date) => montarISO(date.getFullYear(), date.getMonth() + 1, date.getDate());

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
  if (!profissional || !profissional.schedule) return '';

  const nomes = Object.keys(profissional.schedule)
    .map(Number)
    .sort((a, b) => a - b)
    .map((dia) => DIAS_NO_PLURAL[dia])
    .filter(Boolean);

  if (nomes.length === 0) return '';
  if (nomes.length === 1) return nomes[0];
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
}

const SEM_OCUPADOS = [];

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
  fixo = null,
  inicial = null,
  titulo = fixo ? 'Remarcar consulta' : 'Agendar consulta',
  descricao = fixo
    ? 'Escolha uma nova data e um horário livre com o mesmo profissional.'
    : 'Escolha a especialidade, o profissional e o melhor horário para você.',
  rotuloConfirmar = fixo ? 'Confirmar nova data' : 'Confirmar agendamento',
  /* Consultas que a pessoa já tem ({ inicio, fim } em ISO): os horários que
     batem com elas nem aparecem, em vez de falhar só ao confirmar. */
  ocupados = SEM_OCUPADOS,
  /* Campo a mais no topo do formulário (o admin escolhe o paciente) e a
     validação dele: devolve a mensagem de erro ou null. */
  campoExtra = null,
  validarExtra,
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
  const [erroGeral, setErroGeral] = useState(null);
  const [versaoHorarios, setVersaoHorarios] = useState(0);

  const refDialogo = useRef(null);
  const refPrimeiroCampo = useRef(null);
  const refFocoAnterior = useRef(null);

  const opcoes = useOpcoesDeAgendamento({
    aberto,
    especialidadeId: formulario.especialidadeId,
    profissionalId: formulario.profissionalId,
    data: formulario.data,
    versao: versaoHorarios,
  });
  const semCatalogo = !fixo && opcoes.origem === 'erro';

  const especialidades = useMemo(
    () => (fixo ? [{ id: fixo.especialidadeId, name: fixo.especialidade }] : opcoes.especialidades),
    [fixo, opcoes.especialidades],
  );
  const especialidadeEscolhida = especialidades.find((item) => item.id === formulario.especialidadeId) ?? null;
  const profissionais = fixo ? [{ id: fixo.profissionalId, name: fixo.profissional }] : opcoes.profissionais;
  const profissional = profissionais.find((item) => item.id === formulario.profissionalId) ?? null;
  const horarios = useMemo(() => {
    if (!formulario.data || ocupados.length === 0) return opcoes.horarios;
    return opcoes.horarios.filter((livre) => {
      const inicio = dataLocal(formulario.data, livre.horario);
      const fim = new Date(inicio.getTime() + (livre.duracaoMin ?? 30) * 60000);
      return !ocupados.some((o) => new Date(o.inicio) < fim && inicio < new Date(o.fim));
    });
  }, [opcoes.horarios, formulario.data, ocupados]);
  const podeVerHorarios = Boolean(formulario.profissionalId && formulario.data);
  const datasSugeridas = opcoes.datasSugeridas ?? [];
  const resumoPronto = Boolean(formulario.data && formulario.horario);

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

  useEffect(() => {
    if (!aberto) return undefined;

    refFocoAnterior.current = document.activeElement;

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
      if (campo === 'profissionalId' || campo === 'data') {
        atualizado.horario = '';
      }
      return atualizado;
    });
    setErros((anterior) => ({ ...anterior, [campo]: undefined, horario: undefined }));
    setErroGeral(null);
  }

  function validar() {
    const novosErros = {};
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
  }

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const novosErros = validar();
    const erroExtra = validarExtra?.() ?? null;
    if (erroExtra) {
      setErroGeral(erroExtra);
      if (Object.keys(novosErros).length === 0) return;
    }

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

    const profissionalEncontrado = profissionais.find((item) => item.id === formulario.profissionalId);
    const horarioEscolhido = horarios.find((item) => item.horario === formulario.horario);

    setEnviando(true);
    try {
      await aoConfirmar?.({
        especialidadeId: formulario.especialidadeId,
        especialidade: especialidadeEscolhida?.name ?? '',
        profissionalId: formulario.profissionalId,
        profissional: profissionalEncontrado?.name ?? '',
        data: formulario.data,
        horario: formulario.horario,
        modalidade: horarioEscolhido?.modalidade,
      });
      aoFechar?.();
    } catch (erro) {
      setErroGeral(erro?.message ?? 'Não foi possível concluir o agendamento.');
      if (erro?.status === 409) {
        setFormulario((anterior) => ({ ...anterior, horario: '' }));
        setVersaoHorarios((versao) => versao + 1);
      }
    } finally {
      setEnviando(false);
    }
  };

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
          {semCatalogo && (
            <div className={estilos.aviso} role="alert">
              Não foi possível carregar as especialidades. Verifique a conexão e{' '}
              <button type="button" className={estilos.botaoTentar} onClick={opcoes.tentarDeNovo}>
                tente de novo
              </button>
              .
            </div>
          )}

          {campoExtra}

          {/* Especialidade */}
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
              disabled={Boolean(fixo) || !especialidadeEscolhida}
              aria-invalid={erros.profissionalId ? 'true' : undefined}
              aria-describedby={erros.profissionalId ? `${ids.profissional}-erro` : undefined}
            >
              <option value="">
                {especialidadeEscolhida ? 'Selecione o profissional' : 'Escolha a especialidade primeiro'}
              </option>
              {profissionais.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            {profissional && descreverDiasDeAtendimento(profissional) && (
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

          {erroGeral && (
            <p className={estilos.erro} role="alert">{erroGeral}</p>
          )}

          {/* Ações */}
          <div className={estilos.acoes}>
            <button type="button" className={estilos.botaoSecundario} onClick={aoFechar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className={estilos.botaoPrimario} disabled={enviando} aria-busy={enviando}>
              {enviando ? 'Enviando…' : rotuloConfirmar}
              <IconeSeta className={estilos.iconeBotao} />
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}