/** MISSÃO 7 — Agregação (Trilha ◇→ Disciplina) */
class TrilhaEstudo {
  #titulo; #administrador; #disciplinas = [];
  constructor(titulo, administrador) {
    if (!(administrador instanceof Administrador)) throw new Error("A trilha exige um Administrador.");
    this.#titulo = titulo; this.#administrador = administrador;
  }
  get titulo() { return this.#titulo; }
  adicionarDisciplina(d) {
    if (!(d instanceof Disciplina)) throw new Error("Objeto não é uma Disciplina.");
    if (this.#disciplinas.some(x => x.codigo === d.codigo)) return false;
    this.#disciplinas.push(d); return true;
  }
  removerDisciplina(codigo) {
    const i = this.#disciplinas.findIndex(x => x.codigo === codigo);
    if (i < 0) return false;
    this.#disciplinas.splice(i, 1); return true; // o objeto continua vivo fora da trilha
  }
  calcularCargaHorariaTotal() { return this.#disciplinas.reduce((s, d) => s + d.cargaHorariaSemanalHoras, 0); }
  calcularCargaEmMinutos() { return this.calcularCargaHorariaTotal() * 60; }
  gerarResumo() {
    return `Trilha "${this.#titulo}" — ${this.#disciplinas.length} disciplina(s), ${this.calcularCargaHorariaTotal()}h (${this.calcularCargaEmMinutos()} min) — Admin: ${this.#administrador.nome}`;
  }
}
