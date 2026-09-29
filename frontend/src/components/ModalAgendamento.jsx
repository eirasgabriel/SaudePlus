import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOpcoesDeAgendamento } from '../features/paciente/useOpcoesDeAgendamento';
import estilos from './ModalAgendamento.module.css';

/* 
   UTILITÁRIOS
 */

const classes = (...lista) => lista.filter(Boolean).join(' ');

/** Data de hoje em AAAA-MM-DD, no fuso local (não em UTC). */
function hojeISO() {
  const agora = new Date();
  const deslocamento = agora.getTimezoneOffset() * 60000;
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10);
}

/** '2026-10-05' + '14:30' → 'segunda-feira, 5 de outubro de 2026 às 14:30' */
function descreverDataHora(data, horario) {
  if (!data || !horario) return '';
  const [ano, mes, dia] = data.split('-').map(Number);
  const [hora, minuto] = horario.split(':').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' })
    .format(new Date(ano, mes - 1, dia, hora, minuto));
}

const FORMULARIO_VAZIO = {
  especialidadeId: '',
  profissionalId: '',
  data: '',
  horario: '',
};

const SELETOR_FOCAVEIS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/*
   ÍCONES
   */

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

/* 
   COMPONENTE
   */

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
  // Sobe depois de um 409, para buscar de novo os horários livres.
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
  const emMocks = opcoes.origem === 'mocks';

  const especialidades = useMemo(
    () => (fixo ? [{ id: fixo.especialidadeId, name: fixo.especialidade }] : opcoes.especialidades),
    [fixo, opcoes.especialidades],
  );
  const especialidadeEscolhida = especialidades.find((item) => item.id === formulario.especialidadeId) ?? null;
  const profissionais = fixo ? [{ id: fixo.profissionalId, name: fixo.profissional }] : opcoes.profissionais;
  const horarios = opcoes.horarios;
  // Com a API, os horários dependem do médico e da data; nos mocks, só da especialidade.
  const podeVerHorarios = emMocks
    ? Boolean(especialidadeEscolhida)
    : Boolean(formulario.profissionalId && formulario.data);

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
  useEffect(() => {
    if (!aberto) return undefined;

    refFocoAnterior.current = document.activeElement;

    const foco = window.setTimeout(() => refPrimeiroCampo.current?.focus(), 0);

    // Trava a rolagem do fundo sem deslocar o layout
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    const overflowAnterior = document.body.style.overflow;
    const paddingAnterior = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (larguraBarra > 0) document.body.style.paddingRight = `${larguraBarra}px`;

    return () => {
      window.clearTimeout(foco);
      document.body.style.overflow = overflowAnterior;
      document.body.style.paddingRight = paddingAnterior;
      // Devolve o foco ao elemento que abriu o modal
      refFocoAnterior.current?.focus?.();
    };
  }, [aberto]);

  /* ---- Esc fecha; Tab circula dentro do diálogo ---- */
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

  /* ---- Alterações do formulário ---- */
  const alterarCampo = (campo, valor) => {
    setFormulario((anterior) => {
      const atualizado = { ...anterior, [campo]: valor };
      // Trocar a especialidade invalida profissional e horário;
      // trocar profissional ou data invalida o horário.
      if (campo === 'especialidadeId') {
        atualizado.profissionalId = '';
        atualizado.horario = '';
      }
      if (campo === 'profissionalId' || campo === 'data') {
        atualizado.horario = '';
      }
      return atualizado;
    });
    setErros((anterior) => ({ ...anterior, [campo]: undefined }));
    setErroGeral(null);
  };

  const validar = () => {
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
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const novosErros = validar();
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      // Leva o foco para o primeiro campo com erro
      const ordem = ['especialidadeId', 'profissionalId', 'data', 'horario'];
      const primeiro = ordem.find((campo) => novosErros[campo]);
      const mapa = {
        especialidadeId: ids.especialidade,
        profissionalId: ids.profissional,
        data: ids.data,
        horario: ids.horario,
      };
      document.getElementById(mapa[primeiro])?.focus();
      return;
    }

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

  const resumo = descreverDataHora(formulario.data, formulario.horario);

  return createPortal(
    <div
      className={estilos.fundo}
      onMouseDown={(evento) => {
        // Só fecha se o clique começou no fundo, não ao arrastar de dentro
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
        {/* ---- Cabeçalho ---- */}
        <header className={estilos.cabecalho}>
          <span className={estilos.iconeCabecalho} aria-hidden="true">
            <IconeCalendario />
          </span>
          <div className={estilos.textoCabecalho}>
            <h2 id={ids.titulo} className={estilos.titulo}>{titulo}</h2>
            <p id={ids.descricao} className={estilos.descricao}>{descricao}</p>
          </div>
          <button
            type="button"
            className={estilos.botaoFechar}
            onClick={aoFechar}
            aria-label="Fechar"
          >
            <IconeFechar />
          </button>
        </header>

        {/* Formulário  */}
        <form className={estilos.formulario} onSubmit={enviar} noValidate>
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

          {/* Profissional */}
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
            {erros.profissionalId && (
              <p id={`${ids.profissional}-erro`} className={estilos.erro}>{erros.profissionalId}</p>
            )}
          </div>

          {/* Data */}
          <div className={estilos.campo}>
            <label className={estilos.rotulo} htmlFor={ids.data}>Data</label>
            <input
              id={ids.data}
              type="date"
              min={hojeISO()}
              className={classes(estilos.input, erros.data && estilos.campoInvalido)}
              value={formulario.data}
              onChange={(evento) => alterarCampo('data', evento.target.value)}
              aria-invalid={erros.data ? 'true' : undefined}
              aria-describedby={erros.data ? `${ids.data}-erro` : undefined}
            />
            {erros.data && <p id={`${ids.data}-erro`} className={estilos.erro}>{erros.data}</p>}
          </div>

          {/* Horário */}
          <fieldset
            className={estilos.campo}
            aria-invalid={erros.horario ? 'true' : undefined}
            aria-describedby={erros.horario ? `${ids.horario}-erro` : undefined}
          >
            <legend className={estilos.rotulo}>Horário</legend>

            {!podeVerHorarios ? (
              <p className={estilos.aviso} id={ids.horario} tabIndex={-1}>
                {emMocks
                  ? 'Os horários aparecem depois que você escolhe a especialidade.'
                  : 'Os horários livres aparecem depois que você escolhe o profissional e a data.'}
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

          {/* Resumo da escolha */}
          {resumo && (
            <p className={estilos.resumo}>
              Consulta para <strong>{resumo}</strong>.
            </p>
          )}

          {erroGeral && (
            <p className={estilos.erro} role="alert">{erroGeral}</p>
          )}

          {/* Ações */}
          <div className={estilos.acoes}>
            <button type="button" className={estilos.botaoSecundario} onClick={aoFechar}>
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
