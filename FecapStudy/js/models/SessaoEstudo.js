/** MISSÃO 4 — Classe abstrata + polimorfismo dinâmico (+ paraJson da Missão 6) */
class SessaoEstudo extends IExportavelJson {
  #disciplina; #duracaoMinutos;
  constructor(disciplina, duracaoMinutos) {
    super();
    if (new.target === SessaoEstudo) throw new Error("SessaoEstudo é abstrata e não pode ser instanciada.");
    this.#disciplina = disciplina;
    this.#duracaoMinutos = duracaoMinutos;
  }
  get disciplina() { return this.#disciplina; }
  get duracaoMinutos() { return this.#duracaoMinutos; }
  obterModalidade() { throw new Error("obterModalidade() deve ser implementado."); }
  calcularXp() { throw new Error("calcularXp() deve ser implementado."); }
  gerarFeedback() {
    return `${this.obterModalidade()} em ${this.disciplina.nome} (${this.duracaoMinutos} min) -> +${this.calcularXp()} XP`;
  }
  dadosBase(tipo) {
    return { disciplina: this.disciplina.nome, tipoModalidade: tipo, duracaoMinutos: this.duracaoMinutos,
             xpGanho: this.calcularXp(), resumoFeedback: this.gerarFeedback() };
  }
}

class SessaoPomodoro extends SessaoEstudo {
  #ciclosCompletos;
  constructor(disciplina, duracao, ciclosCompletos = 1) { super(disciplina, duracao); this.#ciclosCompletos = ciclosCompletos; }
  get ciclosCompletos() { return this.#ciclosCompletos; }
  obterModalidade() { return "Pomodoro 🍅"; }
  calcularXp() { return this.duracaoMinutos * 2 + this.#ciclosCompletos * 15; }
  gerarFeedback() {
    return `${this.obterModalidade()} em ${this.disciplina.nome} (${this.duracaoMinutos} min) · ${this.#ciclosCompletos} ciclo(s) concluído(s) -> +${this.calcularXp()} XP`;
  }
  paraJson() { return JSON.stringify({ ...this.dadosBase("Pomodoro"), ciclosCompletos: this.#ciclosCompletos }); }
}

class SessaoExercicios extends SessaoEstudo {
  #totalQuestoes; #acertos;
  constructor(disciplina, duracao, totalQuestoes = 0, acertos = 0) {
    super(disciplina, duracao);
    this.#totalQuestoes = Math.max(0, totalQuestoes);
    this.#acertos = Math.min(Math.max(0, acertos), this.#totalQuestoes);
  }
  get totalQuestoes() { return this.#totalQuestoes; }
  get acertos() { return this.#acertos; }
  obterModalidade() { return "Exercícios ✏️"; }
  calcularXp() { return this.duracaoMinutos + this.#acertos * 10; }
  percentualAcerto() { return this.#totalQuestoes ? Math.round((this.#acertos / this.#totalQuestoes) * 100) : 0; }
  gerarFeedback() {
    return `${this.obterModalidade()} em ${this.disciplina.nome} (${this.duracaoMinutos} min) · ${this.#acertos}/${this.#totalQuestoes} acertos (${this.percentualAcerto()}%) -> +${this.calcularXp()} XP`;
  }
  paraJson() { return JSON.stringify({ ...this.dadosBase("Exercicios"), totalQuestoes: this.#totalQuestoes, acertos: this.#acertos }); }
}

class SessaoLeitura extends SessaoEstudo {
  #paginasLidas; #fezResumo;
  constructor(disciplina, duracao, paginasLidas = 0, fezResumo = false) {
    super(disciplina, duracao); this.#paginasLidas = Math.max(0, paginasLidas); this.#fezResumo = !!fezResumo;
  }
  get paginasLidas() { return this.#paginasLidas; }
  get fezResumo() { return this.#fezResumo; }
  obterModalidade() { return "Leitura 📖"; }
  calcularXp() { return this.duracaoMinutos + this.#paginasLidas * 3 + (this.#fezResumo ? 25 : 0); }
  paraJson() { return JSON.stringify({ ...this.dadosBase("Leitura"), paginasLidas: this.#paginasLidas, fezResumo: this.#fezResumo }); }
}

class SessaoFactory {
  static criar(modalidade, disciplina, duracao, extras = {}) {
    switch (modalidade) {
      case "Pomodoro": return new SessaoPomodoro(disciplina, duracao, extras.ciclos ?? Math.max(1, Math.floor(duracao / 25)));
      case "Exercicios": return new SessaoExercicios(disciplina, duracao, extras.questoes ?? 0, extras.acertos ?? 0);
      case "Leitura": return new SessaoLeitura(disciplina, duracao, extras.paginas ?? 0, extras.resumo ?? false);
      default: throw new Error(`Modalidade desconhecida: ${modalidade}`);
    }
  }
}
