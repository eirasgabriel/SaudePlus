# Imagem do back-end do SaúdePlus.
#
# Duas etapas: a primeira compila, a segunda só executa. A imagem final não
# carrega o JDK nem o código-fonte — fica em torno de um terço do tamanho.
#
# Build local, para conferir antes de subir:
#   docker build -t saudeplus-api .
#   docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod \
#     -e DB_URL=... -e DB_USUARIO=... -e DB_SENHA=... -e JWT_SEGREDO=... saudeplus-api

# ---------------------------------------------------------------------------
# Etapa 1 — compilação
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# As dependências mudam muito menos que o código. Copiando só o pom primeiro,
# o Docker reaproveita a camada de download em toda recompilação que não mexeu
# nas dependências — a diferença é de minutos para segundos.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

COPY src/ src/

# Os testes ficam de fora aqui de propósito: são de integração e sobem um
# Postgres pelo Testcontainers, o que exigiria Docker dentro do Docker. O lugar
# deles é no CI, antes do deploy.
RUN ./mvnw -B -q clean package -DskipTests

# ---------------------------------------------------------------------------
# Etapa 2 — execução
# ---------------------------------------------------------------------------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Usuário sem privilégios: se a aplicação for comprometida, o atacante não
# entra como root no contêiner.
RUN useradd --system --create-home --uid 1001 saudeplus

COPY --from=build /app/target/*.jar app.jar

# Pasta dos resultados de exame. PRECISA de um volume persistente montado aqui
# no serviço de hospedagem — sem isso, todo laudo enviado some no próximo
# deploy, porque o disco do contêiner é descartável.
RUN mkdir -p /dados/arquivos && chown -R saudeplus:saudeplus /dados /app
ENV ARQUIVOS_DIR=/dados/arquivos

USER saudeplus
EXPOSE 8080

# A JVM enxerga o limite de memória do contêiner, mas por padrão reserva uma
# fatia conservadora. Em plano gratuito (512 MB é comum) isso deixa memória
# parada; 75% aproveita melhor sem arriscar o encerramento por falta dela.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"

# Render, Railway e Fly injetam a porta em PORT e esperam que a aplicação
# escute nela. O application.yml lê SERVER_PORT, então a ponte é feita aqui.
# Forma shell (e não a lista) porque as variáveis precisam ser expandidas.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar --server.port=${PORT:-8080}"]
