/** MISSÃO 8 — Composição (Plano ◆→ ItemCronograma) */
class ItemCronograma {
  #diaSemana; #minutosPlanejados;
  constructor(diaSemana, minutosPlanejados) { this.#diaSemana = diaSemana; this.#minutosPlanejados = minutosPlanejados; }
  get diaSemana() { return this.#diaSemana; }
  get minutosPlanejados() { return this.#minutosPlanejados; }
}

class PlanoEstudo {
  #discente; #itens = [];
  constructor(discente) {
    if (!(discente instanceof Discente)) throw new Error("O plano exige um Discente.");
    this.#discente = discente;
  }
  adicionarItem(diaSemana, minutos) {
    if (typeof diaSemana !== "string" || !Number.isFinite(minutos) || minutos <= 0) return false;
    this.#itens.push(new ItemCronograma(diaSemana, minutos)); return true;
  }
  listarItens() { return [...this.#itens]; }
  removerItem(diaSemana) {
    const antes = this.#itens.length;
    this.#itens = this.#itens.filter(i => i.diaSemana !== diaSemana);
    return this.#itens.length < antes;
  }
  calcularTotalSemanal() { return this.#itens.reduce((s, i) => s + i.minutosPlanejados, 0); }
  gerarResumo() {
    return `Plano de ${this.#discente.nome}: ${this.#itens.length} dia(s), ${this.calcularTotalSemanal()} min/semana.`;
  }
}
