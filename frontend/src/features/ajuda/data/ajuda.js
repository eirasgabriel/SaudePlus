import {
  BookOpenIcon, QuestionCircleIcon, ChatDotsIcon, FileTextIcon, MailIcon, PhoneIcon,
} from "../../../components/icons/Icons.jsx";

export const HELP_SUGGESTIONS = ["Agendamento", "Cancelamento", "Planos e pagamento", "Conta e cadastro"];

export const HELP_SHORTCUTS = [
  { icon: BookOpenIcon, title: "Central de ajuda", description: ["Guias e tutoriais passo", "a passo"], href: "/como-funciona" },
  { icon: QuestionCircleIcon, title: "Perguntas frequentes", description: ["Encontre respostas", "rapidamente"], href: "#perguntas-frequentes" },
  { icon: ChatDotsIcon, title: "Fale conosco", description: ["Diversos canais", "de atendimento"], href: "#fale-conosco" },
  { icon: FileTextIcon, title: "Termos e políticas", description: ["Condições de uso", "e privacidade"], action: "termos" },
];

export const FAQ = [
  {
    question: "Como agendar uma consulta pelo SaúdePlus?",
    answer: "Nesta versão, você pode explorar os profissionais e selecionar um horário ilustrativo. A confirmação de consultas ainda não está disponível.",
    tags: ["Agendamento"],
  },
  {
    question: "É possível remarcar ou cancelar uma consulta?",
    answer: "O gerenciamento de consultas será disponibilizado junto com o agendamento. Ainda não é possível remarcar ou cancelar consultas nesta versão.",
    tags: ["Cancelamento", "Agendamento"],
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "Os pagamentos ainda não estão disponíveis. As formas de pagamento e condições dos convênios serão informadas quando o serviço for lançado.",
    tags: ["Planos e pagamento"],
  },
  {
    question: "Como criar uma conta no SaúdePlus?",
    answer: "O cadastro está em desenvolvimento. O botão “Criar conta” informa quando uma funcionalidade ainda não está disponível.",
    tags: ["Conta e cadastro"],
  },
  {
    question: "Meus dados estão seguros na plataforma?",
    answer: "Esta demonstração não solicita cadastro nem envia agendamentos. As informações sobre privacidade serão publicadas antes da disponibilização desses serviços.",
    tags: ["Conta e cadastro"],
  },
  {
    question: "Como falar com um atendente?",
    answer: "Os canais de atendimento ainda não estão disponíveis. Você pode consultar as perguntas desta página enquanto o suporte é preparado.",
    tags: [],
  },
];

export const CONTACT_CHANNELS = [
  { icon: ChatDotsIcon, title: "Chat online", description: "Atendimento em preparação", status: "Em breve" },
  { icon: MailIcon, title: "E-mail", description: "Canal disponível em breve" },
  { icon: PhoneIcon, title: "Telefone", description: "Canal disponível em breve" },
];
