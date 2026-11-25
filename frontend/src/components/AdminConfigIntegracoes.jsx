import { useSearchParams } from "react-router-dom";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import ItemLista, { Lista } from "./ItemLista";
import { Botao } from "./Controles";
import { integracoes, integracoesDisponiveis } from "../services/dadosAdminConfiguracoes";
import comum from "../styles/adminComum.module.css";
import estilos from "../styles/adminConfig.module.css";
import { avisarEmBreve } from "./AvailabilityNotice/emBreve.js";

/**
 * Integrações com a situação real de cada uma: nada aqui liga ou desliga um
 * serviço que ainda não existe. A que tem aba própria (Notificações) abre
 * essa aba.
 */
export default function AdminConfigIntegracoes() {
  const [, definirParametros] = useSearchParams();

  return (
    <div className={estilos.gradePrincipal}>
      <Cartao
        titulo="Configurações de Integrações"
        subtitulo="Gerencie as integrações e conexões externas do sistema SaúdePlus."
        icone="link"
      >
        <Lista>
          {integracoes.map((item) => (
            <ItemLista
              key={item.id}
              icone={item.icone}
              tom={item.tom}
              titulo={item.titulo}
              descricao={item.descricao}
              direita={
                <>
                  <Etiqueta variante={item.situacao.variante} comPonto>
                    {item.situacao.rotulo}
                  </Etiqueta>
                  {item.aba && (
                    <Botao variante="secundario" icone="engrenagem" onClick={() => definirParametros({ aba: item.aba })}>
                      Configurar
                    </Botao>
                  )}
                </>
              }
            />
          ))}
        </Lista>
      </Cartao>

      <div className={estilos.coluna}>
        <Cartao
          titulo="Integrações Disponíveis"
          subtitulo="Conheça as principais integrações que o SaúdePlus oferece."
          icone="link"
        >
          <Lista>
            {integracoesDisponiveis.map((i) => (
              <ItemLista
                key={i.id}
                icone={i.icone}
                tom={i.tom}
                titulo={i.titulo}
                descricao={i.descricao}
                aoClicar={() => avisarEmBreve(i.titulo)}
              />
            ))}
          </Lista>
        </Cartao>

        <div className={comum.aviso}>
          <Icone nome="info" tam={17} className={comum.avisoIcone} />
          <div>
            <div className={comum.avisoTitulo}>Importante</div>
            <p className={comum.avisoTexto}>
              As integrações ajudam a melhorar a comunicação com os pacientes e
              profissionais, reduzindo faltas e agilizando o acesso às informações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
