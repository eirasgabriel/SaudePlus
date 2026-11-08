import { CabecalhoDaTela } from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { useAuth } from "../../auth/auth.context.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { buscarNotificacoes } from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import { NavegacaoProvider } from "../navegacao/NavegacaoProvider.jsx";

const carregarNotificacoes = ({ sinal }) => buscarNotificacoes({ sinal });

/**
 * Casca das telas do médico além do painel: o mesmo cabeçalho e menu, sem a
 * coluna direita, com título e um link de volta opcional.
 *
 * `voltar`: `{ destino, parametros?, rotulo }`. `notificacoes` sobrepõe a lista
 * do sino (a tela de notificações passa a sua, que muda na hora).
 */
export default function TelaDoMedico(props) {
  return (
    <NavegacaoProvider>
      <Casca {...props} />
    </NavegacaoProvider>
  );
}

function Casca({ titulo, subtitulo, voltar, acoes, notificacoes: listaPropria, children }) {
  const { usuario } = useAuth();
  const notificacoes = useDadosDaApi(carregarNotificacoes);
  const lista = listaPropria ?? (notificacoes.origem === "api" ? notificacoes.dados : undefined);

  const medico = {
    nome: usuario?.nomeCompleto ?? "Médico(a)",
    perfil: "Médico(a)",
    avatarUrl: usuario?.fotoUrl ?? null,
  };

  return (
    <DashboardLayout medico={medico} notificacoes={lista}>
      {voltar && (
        <LinkDestino destino={voltar.destino} parametros={voltar.parametros} className={estilos.voltar}>
          ← {voltar.rotulo}
        </LinkDestino>
      )}
      <CabecalhoDaTela titulo={titulo} subtitulo={subtitulo}>
        {acoes}
      </CabecalhoDaTela>
      {children}
    </DashboardLayout>
  );
}
