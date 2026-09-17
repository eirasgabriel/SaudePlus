/* Profissionais (mock) */
import roberto from "../../../assets/images/dr-roberto-almeida.jpg";
import juliana from "../../../assets/images/dr-juliana-castro.jpg";
import marcelo from "../../../assets/images/dr-marcelo-santos.jpg";
import fernanda from "../../../assets/images/dr-fernanda-lima.jpg";

export const PROFESSIONALS = [
  {
    id: "roberto-almeida",
    name: "Dr. Roberto Almeida",
    specialty: "Cardiologia",
    crm: "CRM 123.456-SP",
    rating: 4.9,
    reviews: 328,
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    city: "São Paulo - SP",
    types: ["presencial", "online"],
    insurances: ["Amil", "Bradesco Saúde", "Unimed"],
    slots: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
    photo: roberto,
  },
  {
    id: "juliana-castro",
    name: "Dra. Juliana Castro",
    specialty: "Pediatria",
    crm: "CRM 234.567-SP",
    rating: 4.8,
    reviews: 275,
    address: "R. Haddock Lobo, 650 - Cerqueira César, São Paulo - SP",
    city: "São Paulo - SP",
    types: ["presencial", "online"],
    insurances: ["SulAmérica", "Unimed"],
    slots: ["08:00", "10:00", "11:30", "14:30", "16:00", "18:00"],
    photo: juliana,
  },
  {
    id: "marcelo-santos",
    name: "Dr. Marcelo Santos",
    specialty: "Dermatologia",
    crm: "CRM 345.678-SP",
    rating: 4.9,
    reviews: 412,
    address: "Av. Brigadeiro Faria Lima, 2200 - Itaim Bibi, São Paulo - SP",
    city: "São Paulo - SP",
    types: ["presencial", "online"],
    insurances: ["Amil", "SulAmérica"],
    slots: ["08:30", "10:00", "11:30", "14:00", "16:30", "18:00"],
    photo: marcelo,
  },
  {
    id: "fernanda-lima",
    name: "Dra. Fernanda Lima",
    specialty: "Ginecologia",
    crm: "CRM 456.789-SP",
    rating: 4.8,
    reviews: 301,
    address: "R. Oscar Freire, 1200 - Jardim Paulista, São Paulo - SP",
    city: "São Paulo - SP",
    types: ["presencial", "online"],
    insurances: ["Bradesco Saúde", "Unimed", "Outro convênio"],
    slots: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:30"],
    photo: fernanda,
  },
];

export const formatRating = (value) => value.toFixed(1).replace(".", ",");
