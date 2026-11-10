import { ChatDotsIcon } from "../../../components/icons/Icons.jsx";
import { ClipboardIcon, DotIcon } from "../components/icons/MedicoIcons.jsx";

/* Cada tipo de notificação tem seu ícone e sua cor. Tipo desconhecido
   cai no padrão em vez de renderizar vazio. */
export const TIPOS_NOTIFICACAO = {
  resultado: { icone: DotIcon, tom: "tomAlerta", rotulo: "Resultado" },
  agendamento: { icone: ChatDotsIcon, tom: "tomSucesso", rotulo: "Agendamento" },
  retorno: { icone: ClipboardIcon, tom: "tomInfo", rotulo: "Retorno" },
};

export const TIPO_PADRAO = { icone: DotIcon, tom: "tomInfo", rotulo: "Aviso" };
