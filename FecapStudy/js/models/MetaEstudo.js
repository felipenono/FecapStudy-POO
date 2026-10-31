/** MISSÃO 2 — Encapsulamento */
class MetaEstudo extends IExportavelJson {
  #metaMinutosSemana = 0; #minutosCumpridos = 0;
  constructor(metaMinutosSemana) { super(); this.redefinirMeta(metaMinutosSemana); }
  get metaMinutosSemana() { return this.#metaMinutosSemana; }
  get minutosCumpridos() { return this.#minutosCumpridos; }
  registrarAvanco(minutos) {
    if (!Number.isFinite(minutos) || minutos <= 0 || minutos > 480) return false;
    this.#minutosCumpridos += minutos; return true;
  }
  redefinirMeta(novaMeta) {
    const n = Number(novaMeta);
    this.#metaMinutosSemana = Math.min(3000, Math.max(30, Number.isFinite(n) ? n : 30));
  }
  calcularPercentual() { return Math.min(100.0, (this.#minutosCumpridos / this.#metaMinutosSemana) * 100); }
  estaCumprida() { return this.#minutosCumpridos >= this.#metaMinutosSemana; }
  paraJson(discenteNome = "", responsavelNome = "") {
    return JSON.stringify({ discenteNome, responsavelNome, metaMinutosSemana: this.#metaMinutosSemana });
  }
}
