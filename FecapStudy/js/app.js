/** MISSÃO 10 — Tela + integração */
const api = new ApiService("http://localhost:5080");
const servicoAlerta = new ServicoAlertaResponsavel();

const catalogo = [
  new Disciplina("ADS201", "Programação Orientada a Objetos", "Computação", 4),
  new Disciplina("ADS202", "Banco de Dados", "Computação", 4),
  new Disciplina("ADS203", "Engenharia de Software", "Gestão", 0) // 0 → vira 2h
];
const discente = new Discente(1, "Lucas Silva", "lucas@email.com", "123", "RA2024001");
const responsavel = new Responsavel(2, "Carlos Silva", "carlos@email.com", "abc", "Pai");
responsavel.vincularDiscente(discente);
const meta = new MetaEstudo(300);
responsavel.definirMetaDoDiscente(discente, meta);
let historicoLocal = [];
let listaExibida = historicoLocal;
let sincronizado = false;
let sincronizando = false;
let enviandoPendentes = false;
const pendentes = []; // sessões que o backend ainda não recebeu

const $ = id => document.getElementById(id);
const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function exibirToast(msg, tipo = "success") {
  const cores = { success: "bg-success", info: "bg-primary", warning: "bg-warning text-dark", error: "bg-danger" };
  const el = document.createElement("div");
  el.className = `toast-item ${cores[tipo] || cores.info}`;
  el.textContent = msg;
  $("toast").appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function atualizarStatusBackend(online, modo = "") {
  const b = $("statusBackend");
  b.className = `badge ${online ? "online" : "offline"}`;
  b.textContent = online ? `Backend online${modo ? " · " + modo : ""}` : "Backend offline";
}

function atualizarKpis() {
  const hoje = historicoLocal.filter(h => h.data === hojeISO());
  $("kpiSessoes").textContent = hoje.length;
  $("kpiXp").textContent = discente.xpTotal;
  $("kpiMinutos").textContent = meta.minutosCumpridos;
  $("kpiMeta").textContent = meta.calcularPercentual().toFixed(0) + "%";
}

function atualizarBarraProgresso() {
  const p = meta.calcularPercentual();
  const barra = $("barraProgresso");
  barra.style.width = p + "%";
  barra.className = "progress-bar " + (p >= 100 ? "bg-success" : p >= 60 ? "bg-primary" : p >= 30 ? "bg-warning" : "bg-danger");
  $("textoProgresso").textContent = `${meta.minutosCumpridos} de ${meta.metaMinutosSemana} min (${p.toFixed(1)}%)`;
}

function renderizarHistorico(lista = listaExibida) {
  const filtro = $("inputFiltro").value.trim().toLowerCase();
  const itens = lista.filter(h => !filtro || `${h.nome} ${h.disciplina} ${h.tipo} ${h.feedback}`.toLowerCase().includes(filtro));
  const ul = $("listaHistorico");
  ul.innerHTML = "";
  if (!itens.length) { ul.innerHTML = '<li class="list-group-item text-muted">Nenhuma sessão registrada ainda. Preencha o formulário para começar.</li>'; return; }
  [...itens].reverse().forEach(h => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `<div class="d-flex justify-content-between"><strong></strong><span class="badge bg-primary">+${h.xp} XP</span></div><small class="text-muted"></small>`;
    li.querySelector("strong").textContent = `${h.nome} · ${h.disciplina}`;
    li.querySelector("small").textContent = h.feedback;
    ul.appendChild(li);
  });
}

function carregarSelectDisciplinas() {
  $("selectDisciplina").innerHTML = catalogo.map(d => `<option value="${d.codigo}">${d.nome}</option>`).join("");
}

function lerExtras(duracao) {
  const mod = $("selectModalidade").value;
  const a = parseInt($("inputExtra1").value), b = parseInt($("inputExtra2").value);
  if (mod === "Pomodoro") return { ciclos: Number.isFinite(a) && a > 0 ? a : Math.max(1, Math.floor(duracao / 25)) };
  if (mod === "Exercicios") return { questoes: a || 0, acertos: b || 0 };
  return { paginas: a || 0, resumo: $("checkResumo").checked };
}

function atualizarCamposExtras() {
  const mod = $("selectModalidade").value;
  const cfg = {
    Pomodoro: ["Ciclos concluídos (opcional)", null],
    Exercicios: ["Questões resolvidas", "Acertos"],
    Leitura: ["Páginas lidas", null]
  }[mod];
  $("labelExtra1").textContent = cfg[0];
  $("grupoExtra2").style.display = cfg[1] ? "" : "none";
  if (cfg[1]) $("labelExtra2").textContent = cfg[1];
  $("grupoResumo").style.display = mod === "Leitura" ? "" : "none";
  atualizarPreviaXp();
}

function atualizarPreviaXp() {
  const dur = parseInt($("inputDuracao").value);
  if (!(dur >= 1 && dur <= 480)) { $("previaXp").textContent = "—"; return; }
  const disc = catalogo.find(d => d.codigo === $("selectDisciplina").value);
  const s = SessaoFactory.criar($("selectModalidade").value, disc, dur, lerExtras(dur));
  $("previaXp").textContent = `+${s.calcularXp()} XP`;
}

async function registrarSessao(event) {
  event.preventDefault();
  const nome = $("inputNome").value.trim();
  const disc = catalogo.find(d => d.codigo === $("selectDisciplina").value);
  const duracao = parseInt($("inputDuracao").value);
  if (!nome) return exibirToast("Informe o nome do discente.", "warning");
  if (!disc) return exibirToast("Escolha uma disciplina.", "warning");
  if (!(duracao >= 1 && duracao <= 480)) return exibirToast("A duração deve ficar entre 1 e 480 minutos.", "warning");

  const sessao = SessaoFactory.criar($("selectModalidade").value, disc, duracao, lerExtras(duracao));
  discente.registrarEstudo(sessao);
  meta.registrarAvanco(duracao);
  historicoLocal.push({ nome, disciplina: disc.nome, tipo: sessao.obterModalidade(), xp: sessao.calcularXp(), feedback: sessao.gerarFeedback(), data: hojeISO() });
  listaExibida = historicoLocal;
  atualizarKpis(); atualizarBarraProgresso(); renderizarHistorico();
  exibirToast(`Sessão registrada! ${sessao.gerarFeedback()}`, "success");

  const payload = { discenteNome: nome, ...JSON.parse(sessao.paraJson()) };
  try {
    await api.criarSessao(payload);
    exibirToast("Sessão gravada no banco.", "info");
  } catch (e) {
    console.error(e);
    pendentes.push(payload);
    exibirToast("Backend não respondeu: a sessão será enviada quando ele voltar.", "error");
  }
}

function notificarResponsavel() {
  const ok = servicoAlerta.avaliarDiscente(discente, meta, responsavel, new NotificadorEmail());
  exibirToast(ok ? "Responsável notificado (veja o console)." : "Não foi possível notificar.", ok ? "success" : "error");
}

async function buscarRelatorio() {
  const nome = $("inputRelatorioNome").value.trim();
  if (!nome) return exibirToast("Digite o nome do discente.", "warning");
  try {
    $("relatorioResultado").textContent = JSON.stringify(await api.relatorio(nome), null, 2);
  } catch (e) {
    $("relatorioResultado").textContent = "Não foi possível buscar o relatório: " + e.message;
    exibirToast("Falha ao buscar relatório.", "error");
  }
}

const mapearSessaoServidor = s => ({
  id: s.id ?? 0, nome: s.discenteNome ?? "—", disciplina: s.disciplina ?? "—", tipo: s.tipoModalidade ?? "",
  xp: s.xpGanho ?? 0, feedback: s.resumoFeedback ?? "", data: String(s.dataRegistro ?? "").slice(0, 10)
});
const porIdCrescente = (x, y) => x.id - y.id;

async function carregarHistoricoDoServidor() {
  try {
    const dados = await api.listarSessoes();
    listaExibida = (Array.isArray(dados) ? dados : []).map(mapearSessaoServidor).sort(porIdCrescente);
    renderizarHistorico();
    exibirToast(`${listaExibida.length} sessão(ões) carregada(s) do servidor.`, "info");
  } catch (e) {
    exibirToast("Não foi possível carregar o histórico do servidor.", "error");
  }
}

async function enviarPendentes() {
  if (enviandoPendentes) return;
  enviandoPendentes = true;
  try {
    while (pendentes.length) {
      await api.criarSessao(pendentes[0]);
      pendentes.shift();
      exibirToast("Sessão pendente enviada ao banco.", "info");
    }
  } finally { enviandoPendentes = false; }
}

/** Carrega do backend: catálogo, meta, XP e histórico do discente (uma vez, quando o backend estiver online). */
async function sincronizarComServidor() {
  if (sincronizado || sincronizando) return;
  sincronizando = true;
  try {
    const mesmoNome = x => String(x.discenteNome ?? "").toLowerCase() === discente.nome.toLowerCase();
    const [discs, metas, sessoes] = await Promise.all([api.listarDisciplinas(), api.listarMetas(discente.nome), api.listarSessoes(discente.nome)]);
    let m = (Array.isArray(metas) ? metas : []).find(mesmoNome);
    if (!m) m = await api.criarMeta(JSON.parse(meta.paraJson(discente.nome, responsavel.nome)));

    // a partir daqui não há mais chamadas de rede: o estado é aplicado de uma vez
    if (Array.isArray(discs) && discs.length) {
      catalogo.splice(0, catalogo.length, ...discs.map(d => new Disciplina(`DB${d.id}`, d.nome, d.categoria, d.cargaHorariaSemanal)));
      carregarSelectDisciplinas(); atualizarPreviaXp();
    }
    historicoLocal.length = 0;
    (Array.isArray(sessoes) ? sessoes : []).filter(mesmoNome).map(mapearSessaoServidor).sort(porIdCrescente).forEach(h => historicoLocal.push(h));
    discente.adicionarXp(Math.max(0, historicoLocal.reduce((t, h) => t + h.xp, 0) - discente.xpTotal));
    meta.redefinirMeta(m.metaMinutosSemana);
    for (let resto = (m.minutosCumpridos ?? 0) - meta.minutosCumpridos; resto > 0; resto -= 480) meta.registrarAvanco(Math.min(480, resto));

    listaExibida = historicoLocal;
    atualizarKpis(); atualizarBarraProgresso(); renderizarHistorico();
    sincronizado = true;
    exibirToast("Dados carregados do servidor.", "info");
  } finally { sincronizando = false; }
}

async function verificarBackend() {
  try {
    const st = await api.status();
    atualizarStatusBackend(true, st && st.usandoMySql ? "MySQL" : "JSON local");
  } catch { atualizarStatusBackend(false); return; }
  try { await enviarPendentes(); await sincronizarComServidor(); }
  catch (e) { console.error(e); exibirToast("Backend online, mas a sincronização falhou. Tentando de novo.", "warning"); }
}

/** Demonstração das missões no console (critérios de aceite). */
function demonstrarMissoes() {
  console.group("Missão 1"); catalogo.forEach(d => console.log(d.exibirResumo())); console.groupEnd();
  console.group("Missão 2");
  const m = new MetaEstudo(10); console.log("meta 10 →", m.metaMinutosSemana);
  m.redefinirMeta(99999); console.log("meta 99999 →", m.metaMinutosSemana);
  try { m.minutosCumpridos = 99999; } catch {} console.log("minutos após fraude:", m.minutosCumpridos);
  console.groupEnd();
  console.group("Missão 3");
  try { new Usuario(); } catch (e) { console.log("Erro esperado:", e.message); }
  const adm = new Administrador(9, "Ana", "ana@fecap.br", "x", "Coordenadora");
  [adm, responsavel, discente].forEach(u => console.log(u.gerarPainelResumo()));
  console.log("discente.senha =", discente.senha);
  console.groupEnd();
  console.group("Missão 4–6");
  const sessoes = [new SessaoPomodoro(catalogo[0], 25, 2), new SessaoExercicios(catalogo[1], 30, 10, 8), new SessaoLeitura(catalogo[2], 20, 10, true)];
  let xp = 0; for (const s of sessoes) { console.log(s.gerarFeedback()); console.log(s.paraJson()); xp += s.calcularXp(); }
  console.log("XP total:", xp);
  for (const n of [new NotificadorEmail(), new NotificadorWhatsApp(), new NotificadorPainel()]) n.enviarAlerta(n instanceof NotificadorWhatsApp ? "(11) 91234-5678" : "carlos@email.com", "Teste " + n.obterCanal());
  console.groupEnd();
  console.group("Missão 5 e 7–8");
  const teste = new Discente(3, "Teste", "t@t.com", "1", "RA0");
  teste.registrarEstudo(catalogo[0], 50); teste.registrarEstudo(catalogo[1], 14, 15.5, 12);
  try { teste.registrarEstudo("texto", 10, 20); } catch (e) { console.log("Erro esperado:", e.message); }
  console.log("vincular 2×:", responsavel.vincularDiscente(discente));
  const trilha = new TrilhaEstudo("ADS 2º sem", adm);
  catalogo.forEach(d => trilha.adicionarDisciplina(d)); console.log(trilha.gerarResumo());
  trilha.removerDisciplina("ADS201"); console.log("Disciplina viva:", catalogo[0].nome);
  const plano = new PlanoEstudo(discente); plano.adicionarItem("Seg", 60); plano.listarItens().push("hack");
  console.log(plano.gerarResumo(), "| itens:", plano.listarItens().length);
  console.groupEnd();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarSelectDisciplinas(); atualizarCamposExtras();
  atualizarKpis(); atualizarBarraProgresso(); renderizarHistorico();
  $("formSessao").addEventListener("submit", registrarSessao);
  $("btnNotificar").addEventListener("click", notificarResponsavel);
  $("btnRelatorio").addEventListener("click", buscarRelatorio);
  $("btnAtualizar").addEventListener("click", carregarHistoricoDoServidor);
  $("inputFiltro").addEventListener("input", () => renderizarHistorico());
  ["inputDuracao", "selectDisciplina", "inputExtra1", "inputExtra2", "checkResumo"].forEach(id => $(id).addEventListener("input", atualizarPreviaXp));
  $("selectModalidade").addEventListener("change", atualizarCamposExtras);
  verificarBackend();
  setInterval(verificarBackend, 5000); // reconecta sozinho quando o backend for iniciado depois da tela
  demonstrarMissoes();
});
