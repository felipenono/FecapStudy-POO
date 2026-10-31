/** MISSÃO 1 — Abstração, Classe e Objeto */
class Disciplina {
  constructor(codigo, nome, categoria, cargaHorariaSemanalHoras) {
    this.codigo = codigo;
    this.nome = nome;
    this.categoria = categoria;
    this.cargaHorariaSemanalHoras = cargaHorariaSemanalHoras > 0 ? cargaHorariaSemanalHoras : 2;
  }
  calcularCargaEmMinutos() { return this.cargaHorariaSemanalHoras * 60; }
  exibirResumo() {
    return `[${this.codigo}] ${this.nome} (${this.categoria}) — ${this.cargaHorariaSemanalHoras}h/semana (${this.calcularCargaEmMinutos()} min)`;
  }
  toJSON() {
    return { codigo: this.codigo, nome: this.nome, categoria: this.categoria, cargaHorariaSemanalHoras: this.cargaHorariaSemanalHoras };
  }
}
