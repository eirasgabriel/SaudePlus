import { FAQ } from "../../features/ajuda/data/ajuda.js";

/*
 * Respostas automáticas do chat online.
 * Ainda não há atendimento com pessoas nem API de chat: o assistente responde
 * com o mesmo texto das Perguntas frequentes da Ajuda (uma fonte só) e, quando
 * não reconhece a pergunta, diz isso e aponta a Central de ajuda.
 */

const porPergunta = (inicio) => FAQ.find((f) => f.question.startsWith(inicio))?.answer ?? "";

/** Assuntos que o chat reconhece. `palavras` são radicais, sem acento. */
export const ASSUNTOS = [
  {
    id: "agendar",
    sugestao: "Como agendar uma consulta?",
    palavras: ["agend", "marc", "consult", "horari", "medic", "especialid", "profission"],
    resposta: porPergunta("Como agendar"),
    link: { rotulo: "Buscar profissionais", para: "/buscar" },
  },
  {
    id: "remarcar",
    sugestao: "Posso remarcar ou cancelar?",
    palavras: ["remarc", "cancel", "desmarc", "adiar", "trocar", "mudar"],
    resposta: porPergunta("É possível remarcar"),
    link: { rotulo: "Minhas consultas", para: "/paciente/consultas" },
  },
  {
    id: "conta",
    sugestao: "Como criar uma conta?",
    palavras: ["conta", "cadastr", "registr", "inscrev", "criar"],
    resposta: porPergunta("Como criar uma conta"),
    link: { rotulo: "Criar conta", para: "/cadastro" },
  },
  {
    id: "senha",
    sugestao: "Esqueci minha senha",
    palavras: ["senha", "esqueci", "recuper", "redefin", "acessar", "entrar", "login"],
    resposta: "Na tela de entrada, use \"Esqueci minha senha\" e informe o e-mail da sua conta. Você recebe um link para criar uma senha nova.",
    link: { rotulo: "Recuperar senha", para: "/recuperar-senha" },
  },
  {
    id: "pagamento",
    sugestao: "Quais as formas de pagamento?",
    palavras: ["pag", "pix", "cartao", "boleto", "conveni", "plano", "preco", "valor", "custa", "cobr"],
    resposta: porPergunta("Quais são as formas"),
  },
  {
    id: "seguranca",
    sugestao: "Meus dados estão seguros?",
    palavras: ["dados", "segur", "privacid", "lgpd", "sigilo"],
    resposta: porPergunta("Meus dados"),
  },
  {
    id: "atendente",
    sugestao: "Quero falar com um atendente",
    palavras: ["atendent", "humano", "pessoa", "falar", "telefon", "email", "e-mail", "contato", "suporte", "ligar"],
    resposta: "O atendimento com pessoas (chat, e-mail e telefone) ainda está em preparação. Por enquanto, eu respondo às dúvidas mais comuns sobre agendamento, conta e consultas.",
    link: { rotulo: "Ver canais de contato", para: "/ajuda#fale-conosco" },
  },
];

export const SAUDACAO = "Olá! Sou o assistente do SaúdePlus. Posso ajudar com agendamento, sua conta e suas consultas. Escolha um assunto ou escreva sua dúvida.";

export const NAO_ENTENDI = {
  texto: "Não encontrei uma resposta para isso. Tente com outras palavras ou escolha um dos assuntos abaixo. A Central de ajuda também reúne as perguntas mais comuns.",
  link: { rotulo: "Abrir a Central de ajuda", para: "/ajuda#perguntas-frequentes" },
};

const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Assunto que melhor casa com o texto digitado, ou null.
 * Conta quantas palavras do texto começam por algum radical do assunto.
 */
export function encontrarAssunto(texto) {
  const palavras = normalizar(texto).split(/[^a-z0-9-]+/).filter((p) => p.length >= 3);
  let melhor = null;
  let maiorPontuacao = 0;
  for (const assunto of ASSUNTOS) {
    const pontos = palavras.filter((p) => assunto.palavras.some((r) => p.startsWith(r))).length;
    if (pontos > maiorPontuacao) {
      melhor = assunto;
      maiorPontuacao = pontos;
    }
  }
  return melhor;
}
