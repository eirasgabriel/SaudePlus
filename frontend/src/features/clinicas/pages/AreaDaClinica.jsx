import { useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout.jsx';
import { useAuth } from '../../auth/auth.context.js';
import { http } from '../../../services/http.js';
import styles from './DashboardDaUnidade.module.css';

export function LayoutDaClinica() {
  const { usuario } = useAuth();
  return <AdminLayout acessoClinica usuario={{ nome: usuario.nomeCompleto, cargo: 'Unidade Clínica', foto: usuario.fotoUrl, naoLidas: 0 }} />;
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
  </div>;
}
