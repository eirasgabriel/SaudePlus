/**
 * Fotos dos pacientes — ponto único de importação.
 *
 * Os arquivos ficam em `src/assets/images/pacientes/`, recortados em quadrado
 * (160×160, foco no rosto) porque o avatar é circular e o corte é central:
 * numa foto de corpo inteiro, o centro cai no peito e o rosto se perde.
 *
 * Quando as fotos vierem da API, troque este módulo por um mapa de URLs —
 * nenhum outro arquivo precisa mudar.
 */
import anaCosta from "../assets/images/pacientes/anacosta.jpg";
import carlosLima from "../assets/images/pacientes/carloslima.jpg";
import fernandaOliveira from "../assets/images/pacientes/fernandaoliveira.jpg";
import joaoPereira from "../assets/images/pacientes/joaopereira.jpg";
import mariaSilva from "../assets/images/pacientes/mariasilva.jpg";

export const fotos = {
  anaCosta,
  carlosLima,
  fernandaOliveira,
  joaoPereira,
  mariaSilva,
};

/**
 * Nome do paciente -> foto. As listas usam nomes completos que variam entre
 * as telas ("Maria Silva" na Dashboard, "Maria Silva Santos" em Usuários),
 * então a busca é por prefixo.
 */
const porNome = [
  { prefixo: "Maria Silva", foto: mariaSilva },
  { prefixo: "João Pereira", foto: joaoPereira },
  { prefixo: "Ana Costa", foto: anaCosta },
  { prefixo: "Carlos Lima", foto: carlosLima },
  { prefixo: "Carlos Eduardo", foto: carlosLima },
  { prefixo: "Fernanda Oliveira", foto: fernandaOliveira },
  { prefixo: "Fernanda Rocha", foto: fernandaOliveira },
];

/** Retorna a foto do paciente, ou null para cair no fallback de iniciais. */
export function fotoDoPaciente(nome = "") {
  return porNome.find((p) => nome.startsWith(p.prefixo))?.foto ?? null;
}
