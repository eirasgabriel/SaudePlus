import { CartaoDaTela, ConteudoCarregado, Dados } from "../../../components/Telas.jsx";
import estilos from "../../../styles/telas.module.css";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import { listarUnidades } from "../medico.api.js";
import TelaDoMedico from "./TelaDoMedico.jsx";

const carregar = ({ sinal }) => listarUnidades({ sinal });

const STATUS = { ativa: "Em funcionamento", manutencao: "Em manutenção", inativa: "Inativa" };

/** "Unidade": onde o médico atende, com endereço, contato e mapa. */
export default function UnidadesDoMedico() {
  const unidades = useDadosDaApi(carregar);

  return (
    <TelaDoMedico titulo="Unidades" subtitulo="Onde você atende. O vínculo é feito pela administração.">
      <ConteudoCarregado estado={unidades} carregando="Carregando unidades…">
        {unidades.dados?.length ? (
          unidades.dados.map((u) => (
            <CartaoDaTela
              key={u.id}
              titulo={u.nome}
              extra={<span className={estilos.itemSecundario}>{STATUS[u.status] ?? u.status}</span>}
            >
              <Dados
                itens={[
                  ["Endereço", [u.endereco, u.bairro].filter(Boolean).join(" – ")],
                  ["Cidade", `${u.cidade} - ${u.uf}`],
                  ["Telefone", u.telefone ? <a key="t" href={`tel:+55${u.telefone.replace(/\D/g, "")}`}>{u.telefone}</a> : null],
                  ["Funcionamento", u.horarioFuncionamento],
                ]}
              />
              {u.mapUrl && (
                <div className={estilos.botoes}>
                  <a className={estilos.botaoSecundario} href={u.mapUrl} target="_blank" rel="noreferrer">
                    Ver no mapa
                  </a>
                </div>
              )}
            </CartaoDaTela>
          ))
        ) : (
          <CartaoDaTela>
            <p className={estilos.vazio}>Você ainda não está vinculado a nenhuma unidade. Procure a administração.</p>
          </CartaoDaTela>
        )}
      </ConteudoCarregado>
    </TelaDoMedico>
  );
}
