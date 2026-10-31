# 📚 FecapStudy — Plataforma de Apoio ao Estudo

Mini-projeto full-stack da disciplina de **Programação Orientada a Objetos (FECAP)**.
Frontend em **JavaScript puro** (HTML5 + CSS3 + Bootstrap 5), backend em **C# (ASP.NET Core)** e persistência em **MySQL**, com fallback automático para um arquivo JSON local.

---

## Sumário

1. [Sobre o projeto](#1-sobre-o-projeto)
2. [Sobre o sistema](#2-sobre-o-sistema)
3. [Tecnologias](#3-tecnologias)
4. [Estrutura de pastas](#4-estrutura-de-pastas)
5. [Como baixar e instalar](#5-como-baixar-e-instalar)
6. [Como executar](#6-como-executar)
7. [Como testar](#7-como-testar)
8. [Configurando o MySQL (opcional)](#8-configurando-o-mysql-opcional)
9. [API REST do backend](#9-api-rest-do-backend)
10. [Conceitos de POO aplicados](#10-conceitos-de-poo-aplicados)
11. [Regras de negócio](#11-regras-de-negócio)
12. [Solução de problemas](#12-solução-de-problemas)

---

## 1. Sobre o projeto

O FecapStudy nasceu de um cenário **PBL (Aprendizagem Baseada em Problemas)** com três dores acontecendo ao mesmo tempo:

| Quem | Dor |
|---|---|
| **Discente** | Estuda, mas não tem métricas do próprio estudo. |
| **Responsável** | Quer acompanhar o estudo do filho sem precisar cobrar. |
| **Administrador** | Precisa estruturar trilhas de estudo e auditar o engajamento. |

A solução é uma plataforma em que o discente **registra sessões de estudo**, ganha **XP** por elas, avança em uma **meta semanal** definida pelo responsável, e o responsável **acompanha o progresso** e pode ser **notificado**.

O projeto também é um exercício completo de POO: todo o domínio em JavaScript aplica **abstração, encapsulamento, herança, polimorfismo (dinâmico e estático), classes abstratas, interfaces** e os **quatro relacionamentos UML** (associação, agregação, composição e dependência).

---

## 2. Sobre o sistema

### 2.1 O que o usuário faz na tela

- **Registra uma sessão de estudo**: informa o nome, a disciplina, a modalidade (Pomodoro, Exercícios ou Leitura) e a duração (1 a 480 minutos). Uma **prévia de XP** é calculada em tempo real, antes de salvar.
- **Acompanha 4 indicadores (KPIs)**: sessões do dia, XP acumulado, minutos estudados e percentual da meta semanal.
- **Vê a barra de progresso da meta**, que muda de cor conforme o avanço:

  | Progresso | Cor |
  |---|---|
  | 100% ou mais | 🟩 Verde |
  | 60% a 99% | 🟦 Azul |
  | 30% a 59% | 🟨 Amarelo |
  | Menos de 30% | 🟥 Vermelho |

- **Consulta o histórico** de sessões, com filtro em tempo real, e pode recarregá-lo do servidor.
- **Busca o relatório** de um discente, vindo do backend.
- **Notifica o responsável**: o sistema avalia a meta e envia uma mensagem (parabéns se 100%, ou o percentual atual). No projeto, o envio por e-mail é simulado no console do navegador.

### 2.2 Como as partes conversam

```
┌────────────────────┐    fetch (JSON)     ┌──────────────────────┐    SQL     ┌───────────┐
│  Frontend (JS)     │ ─────────────────▶  │  Backend C# (5080)   │ ────────▶  │  MySQL    │
│  index.html        │ ◀─────────────────  │  ASP.NET Core        │ ◀────────  │ fecap_    │
│  Live Server       │                     │                      │            │ estudo    │
└────────────────────┘                     │  se MySQL cair:      │            └───────────┘
                                           │  dados_estudo_local  │
                                           │  .json (fallback)    │
                                           └──────────────────────┘
```

### 2.3 Comportamentos importantes

- **Ao abrir a tela**, o frontend carrega do backend as disciplinas, a meta, o XP e o histórico do discente. Os dados sobrevivem a recarregar a página.
- **Badge de status** no topo: cinza (verificando), vermelho (offline) ou verde (online), mostrando também o modo do banco: `Backend online · MySQL` ou `Backend online · JSON local`.
- **Reconexão automática**: a tela confere o backend a cada 5 segundos. Se você iniciar o backend depois de abrir a página, o badge fica verde sozinho.
- **Fila de pendentes**: se o backend estiver fora ao registrar uma sessão, ela aparece na tela normalmente e é **enviada automaticamente** quando o backend voltar.
- **Fallback automático**: se o MySQL estiver parado, o backend passa a gravar em `dados_estudo_local.json`. As rotas HTTP continuam idênticas.

---

## 3. Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES2022, classes e campos privados `#`), Bootstrap 5.3 (CDN) |
| Backend | C# / .NET 10, ASP.NET Core (Minimal APIs), MySqlConnector |
| Banco | MySQL 8 (opcional) ou arquivo JSON local |
| Ferramentas | VS Code, extensão Live Server |

Não é necessário privilégio de administrador para rodar o frontend. A instalação do .NET SDK pode pedir permissão, dependendo do computador.

---

## 4. Estrutura de pastas

```
ProjetosPOO\
├── README.md
├── Backend\
│   ├── iniciar_backend.bat          ← inicia o servidor (use este)
│   ├── mysql_config.txt             ← string de conexão do MySQL
│   ├── banco_estudo.sql             ← script SQL de referência
│   ├── BackendEstudoAPI.exe         ← versão pré-compilada (antiga)
│   └── Source\
│       ├── Program.cs               ← código-fonte do backend
│       └── BackendEstudoAPI.csproj
└── FecapStudy\
    ├── index.html
    ├── css\
    │   └── style.css
    └── js\
        ├── interfaces\
        │   ├── INotificador.js
        │   └── IExportavelJson.js
        ├── models\
        │   ├── Disciplina.js
        │   ├── SessaoEstudo.js      ← SessaoEstudo, Pomodoro, Exercicios, Leitura, SessaoFactory
        │   ├── Usuario.js           ← Usuario, Administrador, Responsavel, Discente
        │   ├── MetaEstudo.js
        │   ├── TrilhaEstudo.js
        │   └── PlanoEstudo.js       ← PlanoEstudo e ItemCronograma
        ├── services\
        │   ├── Notificadores.js     ← Email, WhatsApp, Painel
        │   ├── ServicoAlertaResponsavel.js
        │   └── ApiService.js        ← cliente HTTP do backend
        └── app.js                   ← tela e integração
```

> A ordem dos `<script>` no `index.html` importa. Não a altere.

---

## 5. Como baixar e instalar

### 5.1 Baixar o projeto

1. Baixe o arquivo **`FecapStudy_Completo.zip`**.
2. Se o Windows marcou o arquivo como bloqueado: clique com o botão direito no `.zip` → **Propriedades** → marque **Desbloquear** → **OK**.
3. Extraia em `C:\Users\SEU_USUARIO\ProjetosPOO\`.

> ⚠️ **Não extraia dentro do OneDrive.** A sincronização pode atrapalhar a compilação do backend.

Ao final, você deve ter `ProjetosPOO\Backend` e `ProjetosPOO\FecapStudy` lado a lado.

### 5.2 Instalar o .NET SDK 10 (para o backend)

1. Abra o **CMD** e digite:
   ```
   dotnet --version
   ```
2. Se aparecer `10.x.x`, está pronto.
3. Se der "comando não reconhecido" ou mostrar uma versão menor, baixe o **.NET SDK 10** em <https://dotnet.microsoft.com/download> (é o **SDK**, não só o *Runtime*).
4. **Feche e abra o CMD** e repita o teste.

### 5.3 Instalar o VS Code e o Live Server (para o frontend)

1. Instale o **VS Code**: <https://code.visualstudio.com>.
2. Em **File → Open Folder**, abra a pasta `FecapStudy`.
3. Na aba de extensões (`Ctrl+Shift+X`), instale **Live Server** (de Ritwick Dey). Ela é instalada em `%USERPROFILE%\.vscode`, sem precisar de administrador.

### 5.4 MySQL (opcional)

Não é obrigatório. Sem MySQL, o sistema usa o arquivo JSON e funciona do mesmo jeito. Veja a [seção 8](#8-configurando-o-mysql-opcional) se quiser usar.

---

## 6. Como executar

### Passo 1 — Iniciar o backend

Dê duplo-clique em **`Backend\iniciar_backend.bat`**.

- Na primeira execução ele baixa o pacote MySqlConnector, então **precisa de internet**.
- Se o .NET SDK estiver instalado, o script compila e inicia o código-fonte atual. Sem o SDK, ele usa o `BackendEstudoAPI.exe` antigo e avisa que ele **não contém as correções**.
- A janela preta deve terminar mostrando algo como:

```
URL Base da API   : http://localhost:5080
Painel no Browser : http://localhost:5080/
Modo de Dados     : Fallback Local (dados_estudo_local.json)   ← ou MySQL
```

**Deixe essa janela aberta** enquanto usar o projeto. `Ctrl+C` encerra o servidor.

### Passo 2 — Conferir que o backend está no ar

- Abra <http://localhost:5080>: deve aparecer o **Painel de Diagnóstico** (contagem de usuários, disciplinas, sessões e metas).
- Abra <http://localhost:5080/api/status>: deve aparecer um JSON com `"online": true`.

### Passo 3 — Abrir a tela

No VS Code, clique com o botão direito em **`index.html`** → **Open with Live Server**.

O navegador abre em algo como `http://127.0.0.1:5500`. O badge no topo deve ficar **verde**.

### Passo 4 — Usar

1. Preencha o formulário e clique em **Registrar sessão**.
2. Aparecem um toast verde (sessão registrada) e um azul (gravada no banco).
3. Os KPIs e a barra de progresso avançam, e o item entra no histórico.
4. Confirme em <http://localhost:5080> que o contador de sessões aumentou.

---

## 7. Como testar

### 7.1 Console do navegador (lógica de POO)

Com a tela aberta, pressione **F12** e abra a aba **Console**. Ao carregar, o `app.js` imprime a demonstração das Missões 1 a 8 (resumos das disciplinas, XP das três modalidades, notificadores, trilha, plano etc.).

Para testar fraudes e erros esperados, cole linha por linha:

```js
meta.minutosCumpridos = 99999; meta.minutosCumpridos   // continua igual (encapsulamento)
discente.senha                                         // undefined
new Usuario()                                          // lança erro (classe abstrata)
discente.registrarEstudo("texto", 10, 20)              // lança erro (assinatura inválida)
responsavel.vincularDiscente(discente)                 // false (já vinculado)
```

### 7.2 Fluxo completo com backend

| Ação | Resultado esperado |
|---|---|
| Abrir a tela | Badge verde, KPIs e meta carregados do servidor |
| Registrar sessão | Toast verde + azul, KPI e barra avançam, item no histórico |
| Notificar responsável | Console mostra `📧 [E-mail → carlos@email.com] ...` |
| Buscar relatório | JSON formatado do discente |
| Atualizar do servidor | Histórico recarregado a partir do banco |
| Derrubar o backend e registrar sessão | Toast de erro; a sessão fica pendente |
| Subir o backend de novo | Pendente enviada sozinha em até 5 s |

---

## 8. Configurando o MySQL (opcional)

1. Instale e inicie o serviço do MySQL local.
2. Se o usuário `root` tiver senha, edite **`Backend\mysql_config.txt`**:
   ```
   Server=localhost;Port=3306;Database=fecap_estudo;Uid=root;Pwd=SUA_SENHA;
   ```
3. Reinicie o backend. O banco `fecap_estudo` e as quatro tabelas (`disciplinas`, `usuarios`, `metas_estudo`, `sessoes_estudo`) são criados automaticamente, com dados de demonstração.
4. Confirme: o painel em <http://localhost:5080> mostra **"CONECTADO AO MYSQL LOCAL"** e o badge da tela mostra `· MySQL`.

Também dá para trocar a conexão sem reiniciar: no painel, use o campo **"Configuração de Conexão MySQL Local"** e clique em **Testar e Conectar**.

O arquivo `banco_estudo.sql` serve de referência, caso você prefira criar o banco manualmente.

---

## 9. API REST do backend

Base: `http://localhost:5080`. CORS liberado para qualquer origem.

| Método | Rota | Uso |
|---|---|---|
| GET | `/` | Painel de diagnóstico (HTML) |
| GET | `/api/status` | Status da API e do banco |
| POST | `/api/config/mysql` | Trocar a string de conexão do MySQL |
| GET | `/api/disciplinas` | Listar disciplinas |
| POST | `/api/disciplinas` | Cadastrar disciplina |
| GET | `/api/usuarios?perfil=` | Listar usuários (filtro opcional) |
| POST | `/api/usuarios` | Cadastrar usuário |
| GET | `/api/sessoes?discente=` | Listar sessões, da mais recente para a mais antiga |
| POST | `/api/sessoes` | Registrar sessão |
| GET | `/api/metas?discente=` | Listar metas |
| POST | `/api/metas` | Criar ou atualizar meta |
| GET | `/api/relatorio/{nome}` | Relatório consolidado do discente |

### Exemplo de `POST /api/sessoes`

```json
{
  "discenteNome": "Lucas Silva",
  "disciplina": "Programação Orientada a Objetos",
  "tipoModalidade": "Pomodoro",
  "duracaoMinutos": 25,
  "ciclosCompletos": 1,
  "xpGanho": 65,
  "resumoFeedback": "Pomodoro 🍅 em Programação Orientada a Objetos (25 min) · 1 ciclo(s) concluído(s) -> +65 XP"
}
```

Validações: `discenteNome` obrigatório e `duracaoMinutos` entre 1 e 480. Campos extras (como `ciclosCompletos`) são ignorados pelo backend.

---

## 10. Conceitos de POO aplicados

| # | Conceito | Onde |
|---|---|---|
| 1 | Abstração, classe e objeto | `Disciplina` |
| 2 | Encapsulamento (campos `#privados`) | `MetaEstudo`, `Usuario` |
| 3 | Classe abstrata e herança | `Usuario` → `Administrador`, `Responsavel`, `Discente` |
| 4 | Polimorfismo dinâmico | `calcularXp()` e `gerarFeedback()` sobrescritos em `SessaoPomodoro`, `SessaoExercicios`, `SessaoLeitura` |
| 5 | Polimorfismo estático (sobrecarga simulada) | `Discente.registrarEstudo(...args)` com 3 assinaturas |
| 6 | Interfaces | `INotificador`, `IExportavelJson` |
| 7 | Associação | `Responsavel` → `Discente` |
| 8 | Agregação | `TrilhaEstudo` ◇→ `Disciplina` |
| 9 | Composição | `PlanoEstudo` ◆→ `ItemCronograma` |
| 10 | Dependência | `ServicoAlertaResponsavel`, `ApiService` |
| 11 | Padrão Factory | `SessaoFactory.criar(...)` |

**Detalhes que valem a pena conhecer**

- JavaScript não tem interface nem classe abstrata nativas. Elas são simuladas: a classe mãe lança erro nos métodos que devem ser sobrescritos, e a abstrata bloqueia `new` direto com `new.target`.
- JavaScript não tem sobrecarga de métodos. `registrarEstudo` decide qual forma usar por `args.length` e `instanceof`.
- `MetaEstudo` não tem setter para minutos cumpridos: só `registrarAvanco()` altera o valor, e com validação.
- `Discente.historico` e `PlanoEstudo.listarItens()` devolvem **cópias defensivas**, então alterar a lista devolvida não afeta o objeto.

---

## 11. Regras de negócio

### XP por modalidade

| Modalidade | Fórmula |
|---|---|
| Pomodoro 🍅 | `duração × 2 + ciclos × 15` |
| Exercícios ✏️ | `duração + acertos × 10` |
| Leitura 📖 | `duração + páginas × 3 + (fez resumo ? 25 : 0)` |

Exemplo: Pomodoro de 25 min com 2 ciclos = 25 × 2 + 2 × 15 = **80 XP**.

### Meta semanal

- A meta fica entre **30 e 3000** minutos: valores menores viram 30, maiores viram 3000.
- Cada sessão avança de **1 a 480** minutos. Valores fora disso são recusados.
- O percentual **nunca passa de 100%**, mesmo estudando além da meta.

### Disciplina

- Se a carga horária semanal informada for 0 ou negativa, assume-se **2 horas**.

### Dados de demonstração

| Tipo | Registros |
|---|---|
| Disciplinas | Programação Orientada a Objetos, Banco de Dados e Modelagem SQL, Projeto Interdisciplinar (PI) |
| Usuários | Profa. Helena (Administradora), Carlos Silva (Responsável), Lucas Silva e Mariana Costa (Discentes) |
| Metas | Lucas: 180 min (75 cumpridos); Mariana: 240 min (90 cumpridos) |

---

## 12. Solução de problemas

| Sintoma | Causa provável e solução |
|---|---|
| `dotnet` não é reconhecido | SDK não instalado, ou CMD aberto antes da instalação. Instale o .NET SDK 10 e abra um CMD novo. |
| Erro de restore/NuGet ao iniciar | Falta de internet na primeira execução. Conecte e rode o `.bat` de novo. |
| O `.bat` usa o `.exe` e avisa "versão antiga" | Sem .NET SDK. Instale o SDK 10 para rodar o código corrigido. |
| Erro de compilação em `Program.cs` | Copie a mensagem completa (arquivo, linha e código, como `CS1002`) para pedir ajuda. |
| `address already in use` / porta 5080 ocupada | Feche outra janela do backend. Para mudar a porta: `set PORTA_BACKEND=5081` antes do `.bat`, e ajuste a URL em `new ApiService("http://localhost:5080")` no `app.js`. |
| Badge vermelho "Backend offline" | Confira se a janela do backend está aberta e se <http://localhost:5080/api/status> abre no navegador. |
| Badge vermelho, mas o `/api/status` abre | Abra o DevTools (F12) → Console e veja o erro; pode ser outra porta ou bloqueio do navegador. |
| `POST /api/sessoes` retorna 400 | DevTools → Network → Payload. O nome é obrigatório e a duração deve estar entre 1 e 480. |
| "MySQL não detectado" no painel | Serviço do MySQL parado ou senha errada. Corrija o `mysql_config.txt` ou use o modo JSON, que funciona normalmente. |
| Erro de `#campo` privado no navegador | Navegador antigo. Atualize o Edge ou o Chrome. |
| Erro de build reclamando do OneDrive | Mova o projeto para `C:\Users\SEU_USUARIO\ProjetosPOO\`. |

---

## Créditos

Projeto acadêmico da disciplina de Programação Orientada a Objetos — FECAP.
Cenário PBL: Plataforma de Apoio ao Estudo (FecapStudy).
