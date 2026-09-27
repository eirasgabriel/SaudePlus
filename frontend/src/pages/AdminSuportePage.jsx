import CabecalhoPagina from "../components/CabecalhoPagina";
import Cartao from "../components/Cartao";
import Acordeao from "../components/Acordeao";
import ItemLista, { Lista } from "../components/ItemLista";
import Icone from "../components/Icone";
import { Botao } from "../components/Controles";
import {
  canais,
  perguntasFrequentes,
  horarioAtendimento,
  linksUteis,
} from "../services/dadosAdminSuporte";
import comum from "../styles/adminComum.module.css";
import estilos from "./AdminSuportePage.module.css";

export default function AdminSuportePage() {
  return (
    <>
      <CabecalhoPagina
        titulo="Suporte"
        subtitulo="Estamos aqui para te ajudar! Encontre as informações e canais de atendimento."
        icone="suporte"
        data={new Date(2026, 8, 15)}
      />

      {/* ---------- canais de atendimento ---------- */}
      <section className={estilos.canais} aria-label="Canais de atendimento">
        {canais.map((canal) => (
          <article key={canal.id} className={estilos.canal}>
            <span className={estilos.canalIcone}>
              <Icone nome={canal.icone} tam={30} />
            </span>
            <h2 className={estilos.canalTitulo}>{canal.titulo}</h2>
            <p className={estilos.canalTexto}>{canal.descricao}</p>

            {canal.acao.href ? (
              <a href={canal.acao.href} className={estilos.canalLink}>
                <Botao variante={canal.acao.variante} icone={canal.acao.icone} blocoTotal>
                  {canal.acao.rotulo}
                </Botao>
              </a>
            ) : (
              <Botao variante={canal.acao.variante} icone={canal.acao.icone} blocoTotal>
                {canal.acao.rotulo}
              </Botao>
            )}
          </article>
        ))}
      </section>

      {/* ---------- FAQ + coluna lateral ---------- */}
      <div className={comum.gradePrincipal}>
        <div className={comum.colunaLateral}>
          <Cartao
            titulo="Perguntas Frequentes (FAQ)"
            subtitulo="Encontre respostas para as dúvidas mais comuns."
            icone="chatDuplo"
            acao={{ rotulo: "Ver todas as perguntas", href: "#" }}
          >
            <Acordeao itens={perguntasFrequentes} />

            <div className={estilos.ajuda}>
              <span className={estilos.ajudaIcone}>
                <Icone nome="lampada" tam={22} />
              </span>
              <div className={estilos.ajudaTexto}>
                <strong>Ainda precisa de ajuda?</strong>
                <p>
                  Nossa equipe está pronta para atender. Clique no botão ao lado e fale
                  conosco!
                </p>
              </div>
              <Botao icone="chat">Falar com o Suporte</Botao>
            </div>
          </Cartao>
        </div>

        <div className={comum.colunaLateral}>
          <Cartao>
            <div className={estilos.horario}>
              <span className={estilos.horarioIcone}>
                <Icone nome="suporte" tam={24} />
              </span>
              <div>
                <strong className={estilos.horarioTitulo}>
                  {horarioAtendimento.titulo}
                </strong>
                <p className={estilos.horarioLinha}>
                  <Icone nome="relogio" tam={14} />
                  {horarioAtendimento.dias}
                </p>
                <p className={estilos.horarioHoras}>{horarioAtendimento.horas}</p>
              </div>
            </div>
          </Cartao>

          <Cartao
            titulo="Links úteis"
            subtitulo="Acesse diretamente algumas páginas importantes."
            icone="link"
          >
            <Lista>
              {linksUteis.map((link) => (
                <ItemLista
                  key={link.id}
                  icone={link.icone}
                  titulo={link.titulo}
                  descricao={link.descricao}
                  comSeta
                  aoClicar={() => {}}
                />
              ))}
            </Lista>
          </Cartao>
        </div>
      </div>
    </>
  );
}
