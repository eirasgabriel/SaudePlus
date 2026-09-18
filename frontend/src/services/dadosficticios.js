/* Dados fictícios idênticos ao protótipo.
   Na integração, substitua pelo retorno da API mantendo o mesmo formato. */

export const mockPatient = {
  name: 'Maria Silva',
  role: 'Paciente',
  avatarUrl: null, // ex.: 'https://.../maria.jpg'
};

export const mockNotificationCount = 2;

/** status aceitos: 'confirmada' | 'pendente' | 'cancelada' */
export const mockAppointments = [
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

export const mockUnit = {
  name: 'Clínica da Família – Centro',
  address: 'Rua das Flores, 123 – Saquarema, RJ',
  phone: '(22) 2655-1234',
  hours: 'Segunda a Sexta – 07h às 17h',
  mapUrl: '#',
};

/* 
   ACRÉSCIMOS

   Os três exports abaixo não existiam no arquivo original.
   Foram criados para a ExamesPage e para o ModalAgendamento,
   seguindo o mesmo padrão de nomes em inglês dos demais.
    */

/** status aceitos: 'liberado' | 'em análise' | 'agendado' */
export const mockExams = [
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

/** Atendimentos já realizados, usados na HistoricoPage. */
export const mockHistory = [
  {
    id: 'hist-1',
    dateTime: '2026-09-15T09:00:00',
    clinic: 'Clínica da Família – Centro',
    specialty: 'Clínico Geral',
    professional: 'Dr. Carlos Mendes',
    summary: 'Consulta de rotina. Pressão arterial dentro do esperado.',
    outcome: 'Exames de sangue solicitados',
  },
  {
    id: 'hist-2',
    dateTime: '2026-06-22T15:00:00',
    clinic: 'Policlínica Municipal',
    specialty: 'Dermatologia',
    professional: 'Dr. Rafael Lima',
    summary: 'Avaliação de mancha no braço direito. Sem sinais de alerta.',
    outcome: 'Retorno em 6 meses',
  },
  {
    id: 'hist-3',
    dateTime: '2026-03-08T10:30:00',
    clinic: 'Posto de Saúde – Jaconé',
    specialty: 'Ginecologia',
    professional: 'Dra. Ana Souza',
    summary: 'Consulta preventiva anual.',
    outcome: 'Papanicolau solicitado',
  },
];

/** Opções do ModalAgendamento: especialidade → profissionais e horários. */
export const mockSpecialties = [
  {
    id: 'esp-clinico',
    name: 'Clínico Geral',
    professionals: [
      { id: 'prof-carlos', name: 'Dr. Carlos Mendes' },
      { id: 'prof-juliana', name: 'Dra. Juliana Rocha' },
    ],
    slots: ['07:30', '08:15', '09:00', '10:15', '11:00', '14:00', '15:30', '16:15'],
  },
  {
    id: 'esp-ginecologia',
    name: 'Ginecologia',
    professionals: [{ id: 'prof-ana', name: 'Dra. Ana Souza' }],
    slots: ['08:00', '09:30', '10:45', '13:30', '14:30', '16:00'],
  },
  {
    id: 'esp-dermatologia',
    name: 'Dermatologia',
    professionals: [
      { id: 'prof-rafael', name: 'Dr. Rafael Lima' },
      { id: 'prof-bianca', name: 'Dra. Bianca Nunes' },
    ],
    slots: ['09:00', '10:00', '11:15', '15:00', '16:30'],
  },
  {
    id: 'esp-pediatria',
    name: 'Pediatria',
    professionals: [{ id: 'prof-marcos', name: 'Dr. Marcos Antunes' }],
    slots: ['07:45', '08:30', '09:15', '13:00', '14:45'],
  },
];
