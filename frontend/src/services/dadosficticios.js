/* Dados de exemplo idênticos ao protótipo.
   Na integração, substitua pelo retorno da API mantendo o mesmo formato. */

export const mockPatient = {
  name: 'Maria Silva',
  role: 'Paciente',
  avatarUrl: null, // ex.: 'https://.../maria.jpg'
};

export const mockNotificationCount = 2;

/** status aceitos: 'confirmada'  'pendente' 'cancelada' */
export const mockAppointments = [
  {
    id: 'apt-1',
    dateTime: '2026-09-15T09:00:00',
    clinic: 'Clínica da Família – Centro',
    address: 'Rua das Flores, 123 – Saquarema, RJ',
    specialty: 'Clínico Geral',
    professional: 'Dr. Carlos Mendes',
    status: 'confirmada',
  },
  {
    id: 'apt-2',
    dateTime: '2026-09-28T14:30:00',
    clinic: 'Posto de Saúde – Jaconé',
    address: 'Av. Beira Mar, 456 – Jaconé, RJ',
    specialty: 'Ginecologia',
    professional: 'Dra. Ana Souza',
    status: 'confirmada',
  },
  {
    id: 'apt-3',
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
