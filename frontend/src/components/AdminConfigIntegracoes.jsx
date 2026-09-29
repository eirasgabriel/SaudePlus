import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import ItemLista, { Lista } from "./ItemLista";
import { Interruptor, Botao } from "./Controles";
import { integracoes, integracoesDisponiveis } from "../services/dadosAdminConfiguracoes";
import comum from "../styles/adminComum.module.css";
import estilos from "../styles/adminConfig.module.css";

export default function AdminConfigIntegracoes() {
  const [lista, definirLista] = useState(integracoes);

  function alternar(id, ativo) {
    definirLista((atuais) =>
      atuais.map((i) => (i.id === id ? { ...i, ativo } : i))
    );
  }

  return (
    <div className={estilos.gradePrincipal}>
      <Cartao
        titulo="Configurações de Integrações"
        subtitulo="Gerencie as integrações e conexões externas do sistema SaúdePlus."
        icone="link"
      >
        <Lista>
          {lista.map((item) => {
            const ligado = item.tipo === "interruptor" ? item.ativo : true;

            return (
              <ItemLista
                key={item.id}
                icone={item.icone}
                tom={item.tom}
                titulo={item.titulo}
                descricao={item.descricao}
                comSeta
                direita={
                  <>
                    {item.tipo === "interruptor" ? (
                      <>
                        <Etiqueta variante={ligado ? "sucesso" : "neutro"} comPonto>
                          {ligado ? "Ativo" : "Inativo"}
                        </Etiqueta>
                        <Interruptor
                          ligado={ligado}
                          aoAlternar={(v) => alternar(item.id, v)}
                          rotulo={item.titulo}
                        />
                      </>
                    ) : (
                      <>
                        {item.etiqueta && (
                          <Etiqueta variante={item.etiqueta.variante} comPonto>
                            {item.etiqueta.rotulo}
                          </Etiqueta>
                        )}
                        <Botao variante="secundario" icone="engrenagem">
                          Configurar
                        </Botao>
                      </>
                    )}
                  </>
                }
              />
            );
          })}
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
                aoClicar={() => {}}
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
