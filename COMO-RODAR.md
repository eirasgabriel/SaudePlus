# Como rodar o SaúdePlus

Branch `feature/dashboard-medico`. Duas aplicações independentes: `backend/`
(Java + Spring Boot) e `frontend/` (React + Vite). Cada uma sobe no seu próprio
terminal, a partir da **raiz do projeto** — a pasta onde está este arquivo.

## Antes de começar

| Precisa de | Como conferir |
| --- | --- |
| JDK 21 | `java -version` deve mostrar 21 |
| Node 20 ou mais novo | `node -v` |

Não é preciso instalar o Maven: o `mvnw.cmd` que já está em `backend/` baixa a
versão certa na primeira execução. Essa primeira vez exige internet.

Se `java -version` falhar ou mostrar outra versão, instale o JDK 21 e ajuste o
`JAVA_HOME` para a pasta do JDK, com o `bin` no `PATH`.

## Estrutura

Confira que a pasta se parece com isto antes de rodar qualquer comando:

```text
SaudePlus/
├── COMO-RODAR.md          <- este arquivo
├── README.md
├── docs/
├── backend/
│   ├── mvnw.cmd           <- precisa existir
│   ├── pom.xml            <- precisa existir
│   └── src/
└── frontend/
    ├── package.json       <- precisa existir
    ├── medico.html
    └── src/
```

Se `backend/mvnw.cmd` ou `frontend/package.json` não estiverem aí, a pasta está
incompleta — os comandos abaixo vão falhar com "não é reconhecido como nome de
cmdlet" ou "Could not read package.json".

## 1. Back-end — porta 8080

No PowerShell, a partir da raiz do projeto:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

A primeira execução baixa o Maven e as dependências e demora alguns minutos.
Quando terminar, aparece `Started SaudePlusApplication`. **Deixe este terminal
aberto** — é o servidor rodando.

Para conferir, abra `http://localhost:8080/api/medicos/med-1/painel` no
navegador: deve devolver um JSON com a agenda do dia.

> Como ainda não há controller na raiz, abrir `http://localhost:8080` devolve
> 404. É esperado — as rotas ficam todas sob `/api`.

Para usar outra porta nesta sessão do terminal:

```powershell
$env:SERVER_PORT = '8081'
.\mvnw.cmd spring-boot:run
```

## 2. Front-end — porta 5173

Em **outro** terminal, também a partir da raiz do projeto:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Depois abra:

- `http://localhost:5173/medico.html` — painel do médico
- `http://localhost:5173/` — homepage institucional

O `npm install` só precisa ser rodado na primeira vez, ou quando as
dependências mudarem.

## O painel funciona sem o back-end

Se você subir só o front-end, o painel continua abrindo: ele cai nos dados de
demonstração e mostra uma faixa amarela avisando. É proposital, para quem está
mexendo só no front não precisar subir o Java.

Quando o back-end estiver no ar, a faixa some e os dados passam a vir da API.

## Testes

```powershell
# back-end
cd backend
.\mvnw.cmd test

# front-end
cd frontend
npm test
```

## Problemas comuns

**`.\mvnw.cmd não é reconhecido como nome de cmdlet`**
Você não está dentro de `backend/`, ou a pasta está incompleta. Rode `dir` e
confirme que `mvnw.cmd` aparece na listagem.

**`Could not read package.json`**
Mesma coisa do lado do front: você não está em `frontend/`, ou a pasta veio sem
o `package.json`.

**`cd frontend` diz que o caminho não existe**
Você está um nível acima ou abaixo do lugar certo. Volte para a pasta que
contém este `COMO-RODAR.md` e comece de novo a partir dali.

**A faixa amarela não some com o back-end ligado**
Confira se o back-end está mesmo na 8080 e se o `frontend/.env` aponta para
`http://localhost:8080`. O CORS já libera `http://localhost:5173`.

**No Linux ou macOS**
Troque `.\mvnw.cmd` por `sh ./mvnw` e `copy` por `cp`.
