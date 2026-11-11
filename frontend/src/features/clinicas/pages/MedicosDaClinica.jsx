import { useId, useState } from 'react';
import { useDadosDaApi } from '../../paciente/useDadosDaApi.js';
import PortaoDaApi from '../../../components/PortaoDaApi/PortaoDaApi.jsx';
import DialogoConfirmacao from '../../../components/DialogoConfirmacao.jsx';
import Avatar from '../../../components/Avatar.jsx';
import Panel from '../../medico/components/Panel/Panel.jsx';
import { SearchIcon, StethoscopeIcon, UserPlusLineIcon } from '../../../components/icons/Icons.jsx';
import { buscarMedicosParaVincular, desvincularMedico, listarMedicosDaClinica, vincularMedico } from '../medicosDaClinica.js';
import styles from './MedicosDaClinica.module.css';

const SITUACAO = { ativo: 'Conta ativa', bloqueado: 'Conta bloqueada', inativo: 'Conta inativa' };

/** Aba "Médicos" da área da clínica: vincula médicos já cadastrados à própria unidade. */
export default function MedicosDaClinica() {
  const id = `mc-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const corpo = useDadosDaApi(listarMedicosDaClinica);
  const [aviso, setAviso] = useState(null);
  const [retirar, setRetirar] = useState(null);

  return (
    <div className={styles.pagina}>
      <div className={styles.identidade}>
        <StethoscopeIcon size={24} />
        <div>
          <h1>Médicos da unidade</h1>
          <p>Vincule os médicos que atendem na sua clínica. Eles passam a aparecer para os pacientes nesta unidade.</p>
        </div>
      </div>
      {aviso && <p className={styles.aviso} role="status">{aviso}</p>}
      <div className={styles.grade}>
        <Panel titulo="Corpo clínico" titleId={`${id}-corpo`} icon={StethoscopeIcon}>
          <PortaoDaApi estados={corpo} carregando="Carregando os médicos da unidade…">
            {() => corpo.dados.length ? (
              <ul className={styles.lista}>
                {corpo.dados.map((m) => (
                  <li key={m.id}>
                    <CartaoMedico medico={m} />
                    <button type="button" className={styles.secundario} onClick={() => setRetirar(m)}
                      aria-label={`Desvincular ${m.nome}`}>Desvincular</button>
                  </li>
                ))}
              </ul>
            ) : <p className={styles.vazio}>Nenhum médico vinculado a esta unidade ainda. Use a busca ao lado para vincular.</p>}
          </PortaoDaApi>
        </Panel>
        <BuscaDeMedicos id={id} aoVincular={(medico) => {
          setAviso(`${medico.nome} foi vinculado à unidade.`);
          corpo.recarregar();
        }} />
      </div>
      <DialogoConfirmacao aberto={retirar != null} aoFechar={() => setRetirar(null)}
        titulo="Desvincular médico"
        mensagem={retirar ? `${retirar.nome} deixará de atender nesta unidade e os horários de atendimento nela serão removidos. Consultas futuras impedem o desvínculo.` : ''}
        rotuloConfirmar="Desvincular"
        aoConfirmar={async () => {
          await desvincularMedico(retirar.id);
          setAviso(`${retirar.nome} foi desvinculado da unidade.`);
          corpo.recarregar();
        }} />
    </div>
  );
}

function BuscaDeMedicos({ id, aoVincular }) {
  const [termo, setTermo] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [vinculando, setVinculando] = useState(null);

  async function buscar(evento) {
    evento.preventDefault();
    setErro(null);
    const busca = termo.trim();
    if (busca.length < 2) { setErro('Digite pelo menos 2 caracteres do nome ou CRM.'); return; }
    setBuscando(true);
    try { setResultado(await buscarMedicosParaVincular(busca)); }
    catch (falha) { setErro(falha?.message ?? 'Não foi possível buscar os médicos.'); }
    finally { setBuscando(false); }
  }

  async function vincular(medico) {
    setErro(null);
    setVinculando(medico.id);
    try {
      await vincularMedico(medico.id);
      setResultado((atual) => atual.filter((m) => m.id !== medico.id));
      aoVincular(medico);
    } catch (falha) { setErro(falha?.message ?? 'Não foi possível vincular o médico.'); }
    finally { setVinculando(null); }
  }

  return (
    <Panel titulo="Vincular médico" titleId={`${id}-vincular`} icon={UserPlusLineIcon}>
      <form className={styles.busca} onSubmit={buscar} role="search">
        <label htmlFor={`${id}-termo`}>Nome ou CRM do médico</label>
        <div className={styles.campo}>
          <input id={`${id}-termo`} type="search" value={termo} maxLength={80} autoComplete="off"
            placeholder="Ex.: Ana Souza ou 123456" onChange={(e) => setTermo(e.target.value)} />
          <button type="submit" className={styles.primario} disabled={buscando}>
            <SearchIcon size={18} aria-hidden="true" />{buscando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
        <p className={styles.dica}>Somente médicos já cadastrados pela administração do SaúdePlus aparecem aqui.</p>
      </form>
      {erro && <p className={styles.erro} role="alert">{erro}</p>}
      {resultado && (resultado.length ? (
        <ul className={styles.lista} aria-label="Médicos encontrados">
          {resultado.map((m) => (
            <li key={m.id}>
              <CartaoMedico medico={m} />
              <button type="button" className={styles.primario} disabled={vinculando != null}
                onClick={() => vincular(m)} aria-label={`Vincular ${m.nome}`}>
                {vinculando === m.id ? 'Vinculando…' : 'Vincular'}
              </button>
            </li>
          ))}
        </ul>
      ) : <p className={styles.vazio} role="status">Nenhum médico disponível encontrado para “{termo.trim()}”.</p>)}
    </Panel>
  );
}

function CartaoMedico({ medico }) {
  return (
    <div className={styles.medico}>
      <Avatar nome={medico.nome} foto={medico.fotoUrl} tam={44} />
      <div className={styles.dados}>
        <strong>{medico.nome}</strong>
        <span>CRM {medico.crm}/{medico.crmUf}{medico.especialidades.length ? ` · ${medico.especialidades.join(', ')}` : ''}</span>
        {medico.status !== 'ativo' && <span className={styles.situacao}>{SITUACAO[medico.status] ?? medico.status}</span>}
      </div>
    </div>
  );
}
