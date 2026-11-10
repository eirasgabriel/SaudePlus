import {
  BookOpenLineIcon, QuestionLineIcon, ChatLineIcon, FileLineIcon, MailLineIcon, PhoneLineIcon,
} from "../../../components/icons/Icons.jsx";

/* Cartões de atalho sobre o hero. `acao` marca o que ainda não está publicado. */
export const HELP_SHORTCUTS = [
  { icone: BookOpenLineIcon, titulo: "Central de ajuda", descricao: "Guias, tutoriais e passo a passo", para: "/como-funciona" },
  { icone: QuestionLineIcon, titulo: "Perguntas frequentes", descricao: "Encontre respostas rapidamente", href: "#perguntas-frequentes" },
  { icone: ChatLineIcon, titulo: "Fale conosco", descricao: "Dúvidas e suporte ao atendimento", href: "#fale-conosco" },
  { icone: FileLineIcon, titulo: "Termos e políticas", descricao: "Condições de uso e privacidade", acao: "Termos e políticas" },
];

/* Respostas fiéis ao que o produto faz hoje. */
export const FAQ = [
  {
    question: "Como agendar uma consulta pelo SaúdePlus?",
    answer: "Busque a especialidade ou o profissional, escolha um horário livre na agenda e entre na sua conta para confirmar. A consulta aparece em Consultas, na sua área do paciente.",
  },
  {
    question: "É possível remarcar ou cancelar uma consulta?",
    answer: "Sim. Na sua área do paciente, em Consultas, cada agendamento tem as opções de remarcar para outro horário livre ou cancelar.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "O pagamento pela plataforma ainda não está disponível. As formas de pagamento e os convênios aceitos serão informados quando o serviço for lançado.",
  },
  {
    question: "Como criar uma conta no SaúdePlus?",
    answer: "Clique em Criar conta, preencha nome, e-mail e senha e aceite os Termos de Uso. A conta de paciente fica pronta na hora.",
  },
  {
    question: "Meus dados estão seguros na plataforma?",
    answer: "Sua conta é acessada com e-mail e senha, e cada perfil (paciente, médico ou administração) vê apenas as informações que lhe cabem.",
  },
  {
    question: "Como falar com um atendente?",
    answer: "Os canais de atendimento (chat, e-mail e telefone) estão em preparação e serão anunciados nesta página. Enquanto isso, as respostas acima cobrem as dúvidas mais comuns.",
  },
];

/* Canais de atendimento: ainda em preparação, por isso sem número nem status "on-line". */
export const CONTACT_CHANNELS = [
  { icone: ChatLineIcon, titulo: "Chat online", descricao: "Atendimento em tempo real", status: "Em breve" },
  { icone: MailLineIcon, titulo: "E-mail", descricao: "Canal disponível em breve" },
  { icone: PhoneLineIcon, titulo: "Telefone", descricao: "Canal disponível em breve" },
];
