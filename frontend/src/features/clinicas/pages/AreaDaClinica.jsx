import { useCallback, useMemo, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout.jsx';
import { useAuth } from '../../auth/auth.context.js';
import { http } from '../../../services/http.js';
import { useDadosDaApi } from '../../paciente/useDadosDaApi.js';
import NotificacoesDoAdmin from '../../admin/pages/NotificacoesDoAdmin.jsx';
import * as api from '../clinica.api.js';
import styles from './DashboardDaUnidade.module.css';

const FONTE_DA_CLINICA = {
  listar: api.listarNotificacoes,
  marcarUma: api.marcarNotificacaoComoLida,
  marcarTodas: api.marcarTodasComoLidas,
};

/** Casca da conta da clínica, com o sino relido a cada troca de página (como no admin). */
export function LayoutDaClinica() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const carregarNotificacoes = useCallback(
    ({ sinal }) => api.listarNotificacoes({ sinal }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname],
  );
  const notificacoes = useDadosDaApi(carregarNotificacoes);
  const recarregarNaoLidas = notificacoes.recarregar;
  const contexto = useMemo(() => ({ recarregarNaoLidas }), [recarregarNaoLidas]);
  const notificacoesDoSino = useMemo(
    () => ({
      lista: notificacoes.origem === 'api' ? notificacoes.dados : null,
      marcarUma: api.marcarNotificacaoComoLida,
      marcarTodas: api.marcarTodasComoLidas,
      aoMudar: recarregarNaoLidas,
    }),
    [notificacoes.origem, notificacoes.dados, recarregarNaoLidas],
  );
  return (
    <AdminLayout
      acessoClinica
      contexto={contexto}
      notificacoesDoSino={notificacoesDoSino}
      usuario={{ nome: usuario.nomeCompleto, cargo: 'Unidade Clínica', foto: usuario.fotoUrl, naoLidas: 0 }}
    />
  );
}

/** Avisos de agendamentos da unidade: novos, remarcados e cancelados. */
export function NotificacoesDaClinica() {
  const contexto = useOutletContext();
  return <NotificacoesDoAdmin fonte={FONTE_DA_CLINICA} aoMudar={contexto?.recarregarNaoLidas} />;
}

export function ContaDaClinica() {
  const { usuario } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  async function enviar(evento) {
    evento.preventDefault();
    setErro(null);
    setSucesso(false);
    if (novaSenha !== confirmacao) { setErro('As senhas não conferem.'); return; }
    if (novaSenha.length < 8 || new TextEncoder().encode(novaSenha).length > 72) { setErro('Use pelo menos 8 caracteres e no máximo 72 bytes.'); return; }
    setEnviando(true);
    try {
      await http.put('/api/auth/senha', { senhaAtual, novaSenha }, { autenticado: true });
      setSenhaAtual(''); setNovaSenha(''); setConfirmacao(''); setSucesso(true);
    } catch (falha) { setErro(falha.message ?? 'Não foi possível trocar a senha.'); }
    finally { setEnviando(false); }
  }
  return <div className={styles.painel}>
    <h1>Minha conta</h1><p>{usuario.email}</p>
    <form className={styles.conta} onSubmit={enviar}>
      <h2>Alterar senha</h2>
      <label>Senha atual<input type="password" autoComplete="current-password" required value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} /></label>
      <label>Nova senha<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} /></label>
      <label>Confirmar nova senha<input type="password" autoComplete="new-password" required value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} /></label>
      {erro && <p role="alert">{erro}</p>}{sucesso && <p role="status">Senha alterada.</p>}
      <button className={styles.link} type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar nova senha'}</button>
    </form>
    <ContatoDaUnidade />
  </div>;
}

const carregarPainel = ({ sinal }) => api.buscarPainel({ sinal });

/**
 * Telefone, horário de funcionamento e e-mail de contato, que aparecem para
 * os pacientes. Nome, endereço, CNPJ e o login ficam com a administração.
 */
function ContatoDaUnidade() {
  const painel = useDadosDaApi(carregarPainel);
  const unidade = painel.origem === 'api' ? painel.dados.unidades[0] : null;
  if (painel.origem === 'erro') return <p role="alert">Não foi possível carregar os dados da unidade.</p>;
  if (!unidade) return <p>Carregando os dados da unidade…</p>;
  return <FormularioDeContato key={unidade.id} unidade={unidade} />;
}

function FormularioDeContato({ unidade }) {
  const [dados, setDados] = useState({
    telefone: unidade.telefone ?? '',
    horarioFuncionamento: unidade.horarioFuncionamento ?? '',
    email: unidade.email ?? '',
  });
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const campo = (nome) => ({
    value: dados[nome],
    onChange: (e) => { setMensagem(null); setDados((atual) => ({ ...atual, [nome]: e.target.value })); },
    'aria-invalid': erros[nome] ? 'true' : undefined,
  });

  async function salvar(evento) {
    evento.preventDefault();
    setErros({});
    setMensagem(null);
    setEnviando(true);
    try {
      await api.alterarContato({
        telefone: dados.telefone.trim() || null,
        horarioFuncionamento: dados.horarioFuncionamento.trim() || null,
        email: dados.email.trim() || null,
      });
      setMensagem({ tom: 'status', texto: 'Dados de contato salvos.' });
    } catch (falha) {
      setErros(falha.campos ?? {});
      setMensagem({ tom: 'alert', texto: falha.message ?? 'Não foi possível salvar.' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className={styles.conta} onSubmit={salvar} noValidate aria-labelledby="contato-da-unidade">
      <h2 id="contato-da-unidade">Contato da unidade</h2>
      <p>{unidade.nome}. Nome, endereço e CNPJ são alterados pela administração.</p>
      <label>Telefone<input type="tel" maxLength={20} {...campo('telefone')} /></label>
      {erros.telefone && <p role="alert">{erros.telefone}</p>}
      <label>Horário de funcionamento<input maxLength={200} placeholder="Ex.: Seg a sex, 8h às 17h" {...campo('horarioFuncionamento')} /></label>
      {erros.horarioFuncionamento && <p role="alert">{erros.horarioFuncionamento}</p>}
      <label>E-mail de contato<input type="email" maxLength={180} {...campo('email')} /></label>
      {erros.email && <p role="alert">{erros.email}</p>}
      {mensagem && <p role={mensagem.tom}>{mensagem.texto}</p>}
      <button className={styles.link} type="submit" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar contato'}</button>
    </form>
  );
}
