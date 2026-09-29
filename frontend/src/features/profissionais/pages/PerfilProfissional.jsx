import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../../../components/Button/Button.jsx";
import Container from "../../../components/Container/Container.jsx";
import Rating from "../../../components/Rating/Rating.jsx";
import {
  VerifiedIcon, MapPinIcon, ClockOutlineIcon, PhoneIcon, StarIcon, ArrowRightIcon,
} from "../../../components/icons/Icons.jsx";
import { buscarProfissional, listarAvaliacoes, listarHorarios } from "../profissionais.api.js";
import { agruparHorarios, linkDeAgendamento, paraPerfil, rotuloDoDia } from "../perfil.js";

import styles from "./PerfilProfissional.module.css";

const AVALIACOES_POR_PAGINA = 5;
const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

/** "Dra. Camila Duarte" → "CD": o título não entra nas iniciais. */
function iniciais(nome = "") {
  const partes = nome.replace(/^(dra?\.?)\s+/i, "").split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes.at(-1)[0] : "")).toUpperCase();
}

/** Só links https viram âncora: um `javascript:` vindo do cadastro não pode rodar. */
const linkSeguro = (url) => (typeof url === "string" && url.startsWith("https://") ? url : null);

/**
 * Perfil, horários livres e primeira página de avaliações do profissional.
 * `estado`: "carregando" | "pronto" | "nao-encontrado" | "erro". Horários e
 * avaliações que falham não derrubam o perfil: cada seção avisa sozinha.
 */
function usePerfil(id) {
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState({ chave: null, estado: "carregando" });
  const chave = `${id}|${tentativa}`;

  useEffect(() => {
    const controle = new AbortController();
    const sinal = controle.signal;
    const opcional = (promessa) => promessa.then((dados) => ({ dados }), () => ({ falhou: true }));
    Promise.all([
      buscarProfissional(id, { sinal }),
      opcional(listarHorarios(id, {}, { sinal })),
      opcional(listarAvaliacoes(id, { tamanho: AVALIACOES_POR_PAGINA }, { sinal })),
    ])
      .then(([perfil, horarios, avaliacoes]) => {
        if (sinal.aborted) return;
        setResultado({
          chave,
          estado: "pronto",
          perfil: paraPerfil(perfil),
          dias: horarios.falhou ? null : agruparHorarios(horarios.dados),
          avaliacoes: avaliacoes.falhou ? null : avaliacoes.dados,
        });
      })
      .catch((erro) => {
        if (sinal.aborted) return;
        // 400 é id malformado (link antigo ou digitado): para quem vê, é o mesmo que 404.
        const naoExiste = erro?.status === 404 || erro?.status === 400;
        setResultado({ chave, estado: naoExiste ? "nao-encontrado" : "erro" });
      });
    return () => controle.abort();
  }, [id, chave]);

  const tentarDeNovo = useCallback(() => setTentativa((n) => n + 1), []);
  return { ...(resultado.chave === chave ? resultado : { estado: "carregando" }), tentarDeNovo };
}

function Estado({ titulo, children }) {
  return (
    <Container className={styles.pagina}>
      <section className={styles.estado} aria-labelledby="perfil-titulo">
        <h1 id="perfil-titulo" className={styles.estadoTitulo}>{titulo}</h1>
        {children}
      </section>
    </Container>
  );
}

function Horarios({ id, dias }) {
  if (dias === null) {
    return <p className={styles.vazio}>Não foi possível carregar os horários agora. Tente de novo em instantes.</p>;
  }
  if (!dias.length) {
    return <p className={styles.vazio}>Sem horários livres nas próximas duas semanas.</p>;
  }
  return (
    <ul className={styles.dias}>
      {dias.map(({ data, horarios }) => (
        <li key={data} className={styles.dia}>
          <h3 className={styles.diaTitulo}>{rotuloDoDia(data)}</h3>
          <ul className={styles.horarios}>
            {horarios.map((horario) => (
              <li key={horario}>
                <Link
                  className={styles.horario}
                  to={linkDeAgendamento(id, { data, horario })}
                  aria-label={`Agendar ${rotuloDoDia(data)} às ${horario}`}
                >
                  {horario}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function Avaliacoes({ id, primeiraPagina }) {
  const [paginas, setPaginas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  if (primeiraPagina === null) {
    return <p className={styles.vazio}>Não foi possível carregar as avaliações agora.</p>;
  }
  const ultima = paginas.at(-1) ?? primeiraPagina;
  const itens = [primeiraPagina, ...paginas].flatMap((p) => p.conteudo);
  if (!itens.length) {
    return <p className={styles.vazio}>Este profissional ainda não recebeu avaliações.</p>;
  }

  const verMais = async () => {
    setCarregando(true);
    setErro(false);
    try {
      const proxima = await listarAvaliacoes(id, { pagina: ultima.pagina + 1, tamanho: AVALIACOES_POR_PAGINA });
      setPaginas((anteriores) => [...anteriores, proxima]);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <ul className={styles.avaliacoes}>
        {itens.map((a, n) => (
          <li key={`${a.autor}-${a.data}-${n}`} className={styles.avaliacao}>
            <p className={styles.avaliacaoNota}>
              <StarIcon size={16} aria-hidden="true" />
              <strong>{a.nota}</strong>
              <span className="sr-only">de 5 estrelas</span>
            </p>
            {a.comentario && <p className={styles.avaliacaoTexto}>{a.comentario}</p>}
            <p className={styles.avaliacaoAutor}>
              {a.autor} · {dataCurta.format(new Date(`${a.data}T00:00:00Z`))}
            </p>
          </li>
        ))}
      </ul>
      {erro && <p className={styles.vazio} role="alert">Não foi possível carregar mais avaliações.</p>}
      {ultima.pagina + 1 < ultima.totalPaginas && (
        <button type="button" className={styles.verMais} onClick={verMais} disabled={carregando} aria-busy={carregando}>
          {carregando ? "Carregando…" : "Ver mais avaliações"}
        </button>
      )}
    </>
  );
}

/** Perfil público do profissional (`/profissionais/:id`). */
export default function PerfilProfissional() {
  const { id } = useParams();
  const { estado, perfil, dias, avaliacoes, tentarDeNovo } = usePerfil(id);

  useEffect(() => {
    if (perfil) document.title = `SaúdePlus — ${perfil.nome}`;
  }, [perfil]);

  if (estado === "carregando") {
    return (
      <Estado titulo="Carregando perfil…">
        <p className={styles.vazio} aria-live="polite">Buscando os dados do profissional.</p>
      </Estado>
    );
  }
  if (estado === "nao-encontrado") {
    return (
      <Estado titulo="Profissional não encontrado">
        <p className={styles.vazio}>O perfil pode ter sido removido ou o endereço está incompleto.</p>
        <Button to="/buscar">Buscar profissionais</Button>
      </Estado>
    );
  }
  if (estado === "erro") {
    return (
      <Estado titulo="Não foi possível carregar o perfil">
        <p className={styles.vazio}>O servidor não respondeu. Verifique sua conexão e tente de novo.</p>
        <div className={styles.estadoAcoes}>
          <Button onClick={tentarDeNovo}>Tentar de novo</Button>
          <Button variant="outline" to="/buscar">Voltar para a busca</Button>
        </div>
      </Estado>
    );
  }

  return (
    <Container className={styles.pagina}>
      <p className={styles.voltar}>
        <Link to="/buscar">← Voltar para a busca</Link>
      </p>

      <section className={styles.cabecalho} aria-labelledby="perfil-titulo">
        {perfil.fotoUrl ? (
          <img className={styles.foto} src={perfil.fotoUrl} alt={`Foto de ${perfil.nome}`} width="160" height="160" />
        ) : (
          <span className={`${styles.foto} ${styles.fotoVazia}`} aria-hidden="true">{iniciais(perfil.nome)}</span>
        )}

        <div className={styles.identidade}>
          <h1 id="perfil-titulo" className={styles.nome}>
            {perfil.nome}
            <VerifiedIcon size={22} className={styles.verificado} aria-label="Profissional verificado" />
          </h1>
          <p className={styles.meta}>
            {perfil.especialidades.map((e) => (
              <span key={e.slug} className={styles.tag}>{e.nome}</span>
            ))}
            <span>{perfil.crm}</span>
          </p>
          <Rating value={perfil.nota} reviews={perfil.avaliacoes} className={styles.nota} />
          <ul className={styles.modalidades} aria-label="Formas de atendimento">
            {perfil.modalidades.map((m) => (
              <li key={m.id} className={styles.modalidade}>{m.rotulo}</li>
            ))}
          </ul>
        </div>

        <div className={styles.chamada}>
          {perfil.valorConsulta && (
            <p className={styles.valor}>
              <span>Consulta particular</span>
              <strong>{perfil.valorConsulta}</strong>
            </p>
          )}
          <Button to={linkDeAgendamento(perfil.id)} className={styles.agendar}>Agendar consulta</Button>
          <p className={styles.dica}>Para agendar, entre na sua conta de paciente.</p>
        </div>
      </section>

      <div className={styles.grade}>
        <div className={styles.coluna}>
          {perfil.bio && (
            <section className={styles.secao} aria-labelledby="perfil-sobre">
              <h2 id="perfil-sobre" className={styles.secaoTitulo}>Sobre</h2>
              <p className={styles.bio}>{perfil.bio}</p>
            </section>
          )}

          <section className={styles.secao} aria-labelledby="perfil-horarios">
            <h2 id="perfil-horarios" className={styles.secaoTitulo}>
              <ClockOutlineIcon size={18} aria-hidden="true" /> Próximos horários livres
            </h2>
            <Horarios id={perfil.id} dias={dias} />
          </section>

          <section className={styles.secao} aria-labelledby="perfil-avaliacoes">
            <h2 id="perfil-avaliacoes" className={styles.secaoTitulo}>Avaliações de pacientes</h2>
            <Avaliacoes key={perfil.id} id={perfil.id} primeiraPagina={avaliacoes} />
          </section>
        </div>

        <div className={styles.coluna}>
          <section className={styles.secao} aria-labelledby="perfil-unidades">
            <h2 id="perfil-unidades" className={styles.secaoTitulo}>Onde atende</h2>
            {perfil.unidades.length ? (
              <ul className={styles.unidades}>
                {perfil.unidades.map((u) => (
                  <li key={u.id} className={styles.unidade}>
                    <h3 className={styles.unidadeNome}>{u.nome}</h3>
                    <p className={styles.linha}><MapPinIcon size={15} aria-hidden="true" />{u.endereco}</p>
                    {u.telefone && <p className={styles.linha}><PhoneIcon size={15} aria-hidden="true" />{u.telefone}</p>}
                    {u.horario && <p className={styles.linha}><ClockOutlineIcon size={15} aria-hidden="true" />{u.horario}</p>}
                    {linkSeguro(u.mapUrl) && (
                      <a className={styles.mapa} href={linkSeguro(u.mapUrl)} target="_blank" rel="noopener noreferrer">
                        Ver no mapa <ArrowRightIcon size={14} aria-hidden="true" />
                        <span className="sr-only">(abre em nova aba)</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.vazio}>Nenhuma unidade em funcionamento no momento.</p>
            )}
          </section>

          <section className={styles.secao} aria-labelledby="perfil-convenios">
            <h2 id="perfil-convenios" className={styles.secaoTitulo}>Convênios aceitos</h2>
            {perfil.convenios.length ? (
              <ul className={styles.convenios}>
                {perfil.convenios.map((c) => <li key={c} className={styles.convenio}>{c}</li>)}
              </ul>
            ) : (
              <p className={styles.vazio}>Atende apenas consultas particulares.</p>
            )}
          </section>
        </div>
      </div>
    </Container>
  );
}
