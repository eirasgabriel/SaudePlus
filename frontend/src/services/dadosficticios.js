/**
 * Fonte central dos dados fictícios da área do paciente.
 *
 * Todo export passa por `listaSegura` ou `objetoSeguro` antes de sair daqui.
 * Assim, se um arquivo for editado pela metade ou a API devolver null no lugar
 * de uma coleção, a tela recebe um array ou um objeto vazio e renderiza o estado
 * vazio, em vez de estourar num `.map is not a function`.
 */

const listaSegura = (valor) => (Array.isArray(valor) ? valor : []);
const objetoSeguro = (valor) => (valor && typeof valor === 'object' ? valor : {});

const pacienteBase = {
  name: 'Maria Silva',
  role: 'Paciente',
  avatarUrl: null, // ex.: 'https://.../maria.jpg'
};

export const mockNotificationCount = 2;

/** status aceitos: 'confirmada' | 'pendente' | 'cancelada' */
const agendamentosBase = [
  {
    id: 'agd-1',
    dateTime: '2026-09-15T09:00:00',
    clinic: 'Clínica da Família – Centro',
    address: 'Rua das Flores, 123 – Saquarema, RJ',
    specialty: 'Clínico Geral',
    professional: 'Dr. Carlos Mendes',
    status: 'confirmada',
  },
  {
    id: 'agd-2',
    dateTime: '2026-09-28T14:30:00',
    clinic: 'Posto de Saúde – Jaconé',
    address: 'Av. Beira Mar, 456 – Jaconé, RJ',
    specialty: 'Ginecologia',
    professional: 'Dra. Ana Souza',
    status: 'confirmada',
  },
  {
    id: 'agd-3',
    dateTime: '2026-10-12T10:15:00',
    clinic: 'Policlínica Municipal',
    address: 'Av. Saquarema, 789 – Saquarema, RJ',
    specialty: 'Retorno',
    professional: 'Dr. Carlos Mendes',
    status: 'confirmada',
  },
];

const unidadeBase = {
  name: 'Clínica da Família – Centro',
  address: 'Rua das Flores, 123 – Saquarema, RJ',
  phone: '(22) 2655-1234',
  hours: 'Segunda a Sexta – 07h às 17h',
  mapUrl: '#',
};

// Os exports daqui para baixo não vinham do protótipo original: nasceram para a
// ExamesPage, a HistoricoPage, a ClinicasPage e o ModalAgendamento. Seguem o mesmo
// padrão de nomes em inglês do resto do arquivo para não misturar convenções.

/** status aceitos: 'liberado' | 'em análise' | 'agendado' */
const examesBase = [
  {
    id: 'exa-1',
    dateTime: '2026-09-10T07:30:00',
    name: 'Hemograma completo',
    category: 'Exame de sangue',
    clinic: 'Clínica da Família – Centro',
    professional: 'Dr. Carlos Mendes',
    status: 'liberado',
    resultUrl: '#',
  },
  {
    id: 'exa-2',
    dateTime: '2026-09-10T07:30:00',
    name: 'Glicemia em jejum',
    category: 'Exame de sangue',
    clinic: 'Clínica da Família – Centro',
    professional: 'Dr. Carlos Mendes',
    status: 'liberado',
    resultUrl: '#',
  },
  {
    id: 'exa-3',
    dateTime: '2026-09-16T08:00:00',
    name: 'Ultrassonografia abdominal',
    category: 'Imagem',
    clinic: 'Policlínica Municipal',
    professional: 'Dra. Ana Souza',
    status: 'em análise',
    resultUrl: null,
  },
  {
    id: 'exa-4',
    dateTime: '2026-10-02T09:45:00',
    name: 'Papanicolau',
    category: 'Exame preventivo',
    clinic: 'Posto de Saúde – Jaconé',
    professional: 'Dra. Ana Souza',
    status: 'agendado',
    resultUrl: null,
  },
];

/**
 * Atendimentos já realizados, usados na HistoricoPage.
 * type aceita: 'consulta' | 'exame' | 'procedimento'
 */
const historicoBase = [
  {
    id: 'hist-1',
    type: 'consulta',
    dateTime: '2026-09-15T09:00:00',
    clinic: 'Clínica da Família – Centro',
    address: 'Rua das Flores, 123 – Saquarema, RJ',
    specialty: 'Clínico Geral',
    professional: 'Dr. Carlos Mendes',
    summary: 'Consulta de rotina. Pressão arterial dentro do esperado.',
    outcome: 'Exames de sangue solicitados',
  },
  {
    id: 'hist-2',
    type: 'exame',
    dateTime: '2026-07-04T07:45:00',
    clinic: 'Policlínica Municipal',
    address: 'Av. Saquarema, 789 – Saquarema, RJ',
    specialty: 'Eletrocardiograma',
    professional: 'Dra. Bianca Nunes',
    summary: 'Exame de rotina solicitado no check-up. Ritmo cardíaco normal.',
    outcome: 'Laudo anexado ao prontuário',
  },
  {
    id: 'hist-3',
    type: 'consulta',
    dateTime: '2026-06-22T15:00:00',
    clinic: 'Policlínica Municipal',
    address: 'Av. Saquarema, 789 – Saquarema, RJ',
    specialty: 'Dermatologia',
    professional: 'Dr. Rafael Lima',
    summary: 'Avaliação de mancha no braço direito. Sem sinais de alerta.',
    outcome: 'Retorno em 6 meses',
  },
  {
    id: 'hist-4',
    type: 'procedimento',
    dateTime: '2026-03-08T10:30:00',
    clinic: 'Posto de Saúde – Jaconé',
    address: 'Av. Beira Mar, 456 – Jaconé, RJ',
    specialty: 'Ginecologia',
    professional: 'Dra. Ana Souza',
    summary: 'Coleta de material para exame preventivo, durante a consulta anual.',
    outcome: 'Papanicolau solicitado',
  },
  {
    id: 'hist-5',
    type: 'procedimento',
    dateTime: '2025-11-19T08:20:00',
    clinic: 'Clínica da Família – Centro',
    address: 'Rua das Flores, 123 – Saquarema, RJ',
    specialty: 'Enfermagem',
    professional: 'Enf. Paula Ribeiro',
    summary: 'Aplicação da vacina contra a gripe, campanha anual.',
    outcome: 'Registrado na caderneta de vacinação',
  },
];

/** Unidades da rede, usadas na ClinicasPage. */
const clinicasBase = [
  {
    id: 'cli-centro',
    name: 'Clínica da Família – Centro',
    address: 'Rua das Flores, 123 – Saquarema, RJ',
    phone: '(22) 2655-1234',
    hours: 'Segunda a Sexta – 07h às 17h',
    specialties: ['Clínico Geral', 'Ginecologia', 'Pediatria'],
    mapUrl: '#',
    isPatientUnit: true, // é a unidade de referência da paciente
  },
  {
    id: 'cli-jacone',
    name: 'Posto de Saúde – Jaconé',
    address: 'Av. Beira Mar, 456 – Jaconé, RJ',
    phone: '(22) 2655-5678',
    hours: 'Segunda a Sexta – 08h às 16h',
    specialties: ['Clínico Geral', 'Ginecologia'],
    mapUrl: '#',
    isPatientUnit: false,
  },
  {
    id: 'cli-policlinica',
    name: 'Policlínica Municipal',
    address: 'Av. Saquarema, 789 – Saquarema, RJ',
    phone: '(22) 2655-9012',
    hours: 'Segunda a Sábado – 07h às 19h',
    specialties: ['Dermatologia', 'Ortopedia', 'Cardiologia', 'Exames de imagem'],
    mapUrl: '#',
    isPatientUnit: false,
  },
];

/**
 * Agenda que alimenta o ModalAgendamento.
 *
 * Cada profissional tem o próprio `schedule`: as chaves são o dia da semana
 * no mesmo padrão de Date.getDay() (0 = domingo, 6 = sábado) e o valor é a
 * lista de horários daquele dia. Dias que não aparecem aqui são dias em que
 * o profissional não atende, e o modal bloqueia a seleção.
 *
 * `clinic` e `address` acompanham o profissional porque a consulta confirmada
 * precisa nascer com o local preenchido, no mesmo formato de mockAppointments.
 */
const especialidadesBase = [
  {
    id: 'esp-clinico',
    name: 'Clínico Geral',
    professionals: [
      {
        id: 'prof-carlos',
        name: 'Dr. Carlos Mendes',
        clinic: 'Clínica da Família – Centro',
        address: 'Rua das Flores, 123 – Saquarema, RJ',
        schedule: {
          1: ['07:30', '08:15', '09:00', '10:15', '14:00', '14:45', '15:30'],
          3: ['07:30', '08:15', '09:00', '10:15'],
          5: ['14:00', '14:45', '15:30', '16:15'],
        },
      },
      {
        id: 'prof-juliana',
        name: 'Dra. Juliana Rocha',
        clinic: 'Policlínica Municipal',
        address: 'Av. Saquarema, 789 – Saquarema, RJ',
        schedule: {
          2: ['13:00', '13:45', '14:30', '15:15', '16:00'],
          4: ['08:00', '08:45', '09:30', '13:30', '14:15', '15:00'],
        },
      },
    ],
  },
  {
    id: 'esp-ginecologia',
    name: 'Ginecologia',
    professionals: [
      {
        id: 'prof-ana',
        name: 'Dra. Ana Souza',
        clinic: 'Posto de Saúde – Jaconé',
        address: 'Av. Beira Mar, 456 – Jaconé, RJ',
        schedule: {
          2: ['08:00', '09:30', '10:45'],
          4: ['13:30', '14:30', '16:00'],
        },
      },
    ],
  },
  {
    id: 'esp-dermatologia',
    name: 'Dermatologia',
    professionals: [
      {
        id: 'prof-rafael',
        name: 'Dr. Rafael Lima',
        clinic: 'Policlínica Municipal',
        address: 'Av. Saquarema, 789 – Saquarema, RJ',
        schedule: {
          1: ['09:00', '10:00', '11:15'],
          4: ['15:00', '16:00', '16:30'],
        },
      },
      {
        id: 'prof-bianca',
        name: 'Dra. Bianca Nunes',
        clinic: 'Clínica da Família – Centro',
        address: 'Rua das Flores, 123 – Saquarema, RJ',
        schedule: {
          3: ['14:00', '15:00', '16:00'],
          6: ['08:00', '09:00', '10:00', '11:00'],
        },
      },
    ],
  },
  {
    id: 'esp-pediatria',
    name: 'Pediatria',
    professionals: [
      {
        id: 'prof-marcos',
        name: 'Dr. Marcos Antunes',
        clinic: 'Clínica da Família – Centro',
        address: 'Rua das Flores, 123 – Saquarema, RJ',
        schedule: {
          1: ['07:45', '08:30', '09:15'],
          2: ['07:45', '08:30', '09:15'],
          3: ['09:00', '09:45', '13:00', '14:45'],
          4: ['07:45', '08:30', '09:15'],
          5: ['13:00', '14:45'],
        },
      },
    ],
  },
];

/**
 * Exports públicos.
 *
 * `mockDoctors` nasce de `mockSpecialties` para não haver duas listas de médicos
 * divergindo com o tempo: cada profissional carrega junto a especialidade em que
 * atende. `mockClinic` é o fallback de unidade única, para telas que só precisam
 * de uma e não devem quebrar se a lista vier vazia.
 */

export const mockPatient = objetoSeguro(pacienteBase);
export const mockAppointments = listaSegura(agendamentosBase);
export const mockExams = listaSegura(examesBase);
export const mockHistory = listaSegura(historicoBase);
export const mockClinics = listaSegura(clinicasBase);
export const mockSpecialties = listaSegura(especialidadesBase);

export const mockDoctors = listaSegura(especialidadesBase).flatMap((especialidade) =>
  listaSegura(especialidade.professionals).map((profissional) => ({
    ...profissional,
    specialtyId: especialidade.id,
    specialty: especialidade.name,
  })),
);

const UNIDADE_VAZIA = {
  id: 'cli-indisponivel',
  name: 'Unidade não informada',
  address: 'Endereço não cadastrado',
  phone: '',
  hours: '',
  specialties: [],
  mapUrl: '',
  isPatientUnit: false,
};

// A unidade de referência da paciente, com a primeira da lista como segunda
// opção e um objeto neutro como última, para o card nunca ler `undefined.name`.
export const mockClinic = objetoSeguro(
  listaSegura(clinicasBase).find((clinica) => clinica.isPatientUnit)
    ?? listaSegura(clinicasBase)[0]
    ?? UNIDADE_VAZIA,
);

export const mockUnit = objetoSeguro(unidadeBase) ?? mockClinic;
