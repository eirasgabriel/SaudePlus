import { Link } from "react-router-dom";

import { CabecalhoDaTela } from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";

/** Página avulsa da área do paciente, como Consultas e Clínicas: volta ao painel, título e conteúdo. */
export default function TelaDoPaciente({ titulo, subtitulo, acoes, children }) {
  return (
    <main className={estilos.paginaAvulsa}>
      <div className={estilos.paginaAvulsaConteudo}>
        <Link to="/paciente" className={estilos.voltar}>
          ← Voltar ao painel
        </Link>
        <CabecalhoDaTela titulo={titulo} subtitulo={subtitulo}>
          {acoes}
        </CabecalhoDaTela>
        {children}
      </div>
    </main>
  );
}
