/** MISSÕES 3, 5 e 7 — Usuario abstrata, subclasses, sobrecarga e associação */
class Usuario {
  #id; #nome; #email; #senha;
  constructor(id, nome, email, senha) {
    if (new.target === Usuario) throw new Error("Usuario é abstrata e não pode ser instanciada diretamente.");
    this.#id = id; this.#nome = nome; this.#email = email; this.#senha = senha;
  }
  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get email() { return this.#email; }
  autenticar(senhaDigitada) { return senhaDigitada === this.#senha; }
  obterTipoPerfil() { throw new Error("obterTipoPerfil() deve ser implementado."); }
  gerarPainelResumo() { throw new Error("gerarPainelResumo() deve ser implementado."); }
}

class Administrador extends Usuario {
  #cargo;
  constructor(id, nome, email, senha, cargo) { super(id, nome, email, senha); this.#cargo = cargo; }
  get cargo() { return this.#cargo; }
  obterTipoPerfil() { return "Administrador"; }
  gerarPainelResumo() { return `🛠️ Administrador ${this.nome} — cargo: ${this.#cargo}. Estrutura trilhas e audita engajamento.`; }
}

class Responsavel extends Usuario {
  #parentesco; #discentes = []; #metas = new Map();
  constructor(id, nome, email, senha, parentesco) { super(id, nome, email, senha); this.#parentesco = parentesco; }
  get parentesco() { return this.#parentesco; }
  obterTipoPerfil() { return "Responsável"; }
  gerarPainelResumo() { return `👪 Responsável ${this.nome} (${this.#parentesco}) — acompanha ${this.#discentes.length} discente(s) sem cobrar.`; }
  vincularDiscente(d) {
    if (!(d instanceof Discente)) throw new Error("Só é possível vincular objetos Discente.");
    if (this.#discentes.includes(d)) return false;
    this.#discentes.push(d); return true;
  }
  desvincularDiscente(d) {
    const i = this.#discentes.indexOf(d);
    if (i < 0) return false;
    this.#discentes.splice(i, 1); this.#metas.delete(d.ra); return true;
  }
  definirMetaDoDiscente(d, meta) {
    if (!this.#discentes.includes(d)) throw new Error("Discente não vinculado a este responsável.");
    if (!(meta instanceof MetaEstudo)) throw new Error("Meta inválida.");
    this.#metas.set(d.ra, meta);
  }
  obterMetaDoDiscente(d) { return this.#metas.get(d.ra) ?? null; }
  get discentes() { return [...this.#discentes]; }
}

class Discente extends Usuario {
  #ra; #xpTotal = 0; #historico = [];
  constructor(id, nome, email, senha, ra) { super(id, nome, email, senha); this.#ra = ra; }
  get ra() { return this.#ra; }
  get xpTotal() { return this.#xpTotal; }
  get historico() { return [...this.#historico]; }
  obterTipoPerfil() { return "Discente"; }
  gerarPainelResumo() { return `🎓 Discente ${this.nome} — RA ${this.#ra} — ${this.#xpTotal} XP acumulados.`; }
  adicionarXp(pontos) {
    if (!Number.isFinite(pontos) || pontos <= 0) return false;
    this.#xpTotal += pontos; return true;
  }
  #registrarSessaoInterna(sessao) {
    this.#historico.push(sessao);
    this.adicionarXp(sessao.calcularXp());
    return sessao;
  }
  /** Polimorfismo estático (sobrecarga simulada por args.length + instanceof). */
  registrarEstudo(...args) {
    if (args.length === 1 && args[0] instanceof SessaoEstudo) return this.#registrarSessaoInterna(args[0]);
    if (args.length === 2 && args[0] instanceof Disciplina && typeof args[1] === "number") {
      const [disc, min] = args;
      return this.registrarEstudo(new SessaoPomodoro(disc, min, Math.max(1, Math.floor(min / 25))));
    }
    if (args.length === 4 && args[0] instanceof Disciplina && args.slice(1).every(a => typeof a === "number")) {
      const [disc, ini, fim, paginas] = args;
      const min = Math.round((fim - ini) * 60);
      if (min <= 0) throw new Error("horaFim deve ser maior que horaInicio.");
      return this.registrarEstudo(new SessaoLeitura(disc, min, paginas, true));
    }
    throw new Error("registrarEstudo: assinatura inválida. Use (sessao), (disciplina, minutos) ou (disciplina, horaInicio, horaFim, paginasLidas).");
  }
}
