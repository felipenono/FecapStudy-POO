/** MISSÃO 10 — Dependência: cliente HTTP */
class ApiService {
  #baseUrl;
  constructor(baseUrl = "http://localhost:5080") { this.#baseUrl = baseUrl; }
  async #request(method, path, body) {
    const opts = { method };
    if (body !== undefined) { opts.headers = { "Content-Type": "application/json" }; opts.body = JSON.stringify(body); }
    const resp = await fetch(this.#baseUrl + path, opts);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} em ${method} ${path}`);
    const txt = await resp.text();
    return txt ? JSON.parse(txt) : null;
  }
  status() { return this.#request("GET", "/api/status"); }
  listarDisciplinas() { return this.#request("GET", "/api/disciplinas"); }
  criarDisciplina(d) { return this.#request("POST", "/api/disciplinas", d); }
  listarUsuarios(perfil = "") { return this.#request("GET", `/api/usuarios?perfil=${encodeURIComponent(perfil)}`); }
  criarUsuario(u) { return this.#request("POST", "/api/usuarios", u); }
  listarSessoes(discente = "") { return this.#request("GET", `/api/sessoes?discente=${encodeURIComponent(discente)}`); }
  criarSessao(s) { return this.#request("POST", "/api/sessoes", s); }
  listarMetas(discente = "") { return this.#request("GET", `/api/metas?discente=${encodeURIComponent(discente)}`); }
  criarMeta(m) { return this.#request("POST", "/api/metas", m); }
  relatorio(nome) { return this.#request("GET", `/api/relatorio/${encodeURIComponent(nome)}`); }
}
