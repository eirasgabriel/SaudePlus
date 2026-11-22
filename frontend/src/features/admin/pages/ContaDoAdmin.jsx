import CabecalhoPagina from "../../../components/CabecalhoPagina";
import { CartaoDaTela, Dados } from "../../../components/Telas.jsx";
import { useAuth } from "../../auth/auth.context.js";
import { FormularioDaConta, FormularioDeSenha } from "../../auth/components/FormulariosDaConta.jsx";
import estilos from "./ContaDoAdmin.module.css";

/** Papel de quem está logado na área administrativa. */
const ROTULO_DO_PAPEL = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ENFERMEIRO: "Enfermagem",
  RECEPCIONISTA: "Recepção",
  AGENTE: "Agente comunitário",
};

/**
 * "Minha conta" da área administrativa: os dados de quem está logado (não os
 * do sistema, que ficam em Configurações). E-mail e papel são só leitura (o
 * papel muda pela tela de Usuários); nome, telefone, foto e senha se editam
 * aqui, pelas mesmas rotas de conta do resto do sistema (/api/auth/...).
 */
export default function ContaDoAdmin() {
  const { usuario } = useAuth();

  return (
    <div className={estilos.pagina}>
      <CabecalhoPagina
        titulo="Minha conta"
        subtitulo="As informações da sua conta e os seus dados de acesso."
        icone="usuario"
        data={false}
      />

      <CartaoDaTela titulo="Informações da conta">
        <Dados
          // Nome e telefone se editam logo abaixo, em "Dados da conta".
          itens={[
            ["E-mail de acesso", usuario?.email],
            ["Perfil", ROTULO_DO_PAPEL[usuario?.role] ?? usuario?.role],
          ]}
        />
      </CartaoDaTela>

      <FormularioDaConta />
      <FormularioDeSenha />
    </div>
  );
}
