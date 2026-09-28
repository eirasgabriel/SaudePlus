import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import ItemLista, { Lista } from "./ItemLista";
import { Interruptor, Botao } from "./Controles";
import {
  itensSeguranca,
  statusSeguranca,
  dicasSeguranca,
} from "../services/dadosAdminConfiguracoes";
import estilos from "../styles/adminConfig.module.css";

export default function AdminConfigSeguranca() {
  const [itens, definirItens] = useState(itensSeguranca);

  function alternar(id, ativo) {
    definirItens((atuais) => atuais.map((i) => (i.id === id ? { ...i, ativo } : i)));
  }

  const tudoAtivo = statusSeguranca.every((s) => s.variante === "sucesso");

  return (
    <div className={estilos.gradePrincipal}>
      <Cartao
        titulo="Configurações de Segurança"
        subtitulo="Proteja os dados e garanta o acesso seguro ao sistema."
        icone="escudoCadeado"
      >
        <Lista>
          {itens.map((item) => (
            <ItemLista
              key={item.id}
              icone={item.icone}
              titulo={item.titulo}
              descricao={item.descricao}
              comSeta
              direita={
                item.tipo === "interruptor" ? (
                  <>
                    <Etiqueta variante={item.ativo ? "sucesso" : "neutro"} comPonto>
                      {item.ativo ? "Ativo" : "Inativo"}
                    </Etiqueta>
                    <Interruptor
                      ligado={item.ativo}
                      aoAlternar={(v) => alternar(item.id, v)}
                      rotulo={item.titulo}
                    />
                  </>
                ) : (
                  <Botao variante="secundario" icone={item.botao.icone}>
                    {item.botao.rotulo}
                  </Botao>
                )
              }
            />
          ))}
        </Lista>
      </Cartao>

      <div className={estilos.coluna}>
        <Cartao
          titulo="Status da Segurança"
          subtitulo="Visão geral da proteção do sistema."
          icone="escudo"
        >
          {tudoAtivo && (
            <div className={estilos.statusSeguro}>
              <Icone nome="escudoCheck" tam={22} className={estilos.statusIcone} />
              <div>
                <div className={estilos.statusTitulo}>Sistema Seguro</div>
                <p className={estilos.statusTexto}>
                  Todos os recursos de segurança estão ativos e funcionando
                  corretamente.
                </p>
              </div>
            </div>
          )}

          {statusSeguranca.map((s) => (
            <div key={s.id} className={estilos.statusLinha}>
              <Icone nome="checkCirculo" tam={17} />
              <span className={estilos.statusRotulo}>{s.rotulo}</span>
              <Etiqueta variante={s.variante}>{s.valor}</Etiqueta>
            </div>
          ))}
        </Cartao>

        <Cartao
          titulo="Dicas de Segurança"
          subtitulo="Boas práticas para manter o sistema seguro."
          icone="lampada"
        >
          {dicasSeguranca.map((dica) => (
            <div key={dica} className={estilos.dica}>
              <Icone nome="checkCirculo" tam={16} className={estilos.dicaIcone} />
              {dica}
            </div>
          ))}
        </Cartao>
      </div>
    </div>
  );
}
