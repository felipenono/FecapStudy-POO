/** MISSÃO 8 — Dependência (sem campos de instância) */
class ServicoAlertaResponsavel {
  avaliarDiscente(d, meta, resp, notificador) {
    if (!(d instanceof Discente)) throw new Error("Discente inválido.");
    if (!(meta instanceof MetaEstudo)) throw new Error("Meta inválida.");
    if (!(resp instanceof Responsavel)) throw new Error("Responsável inválido.");
    if (!notificador || typeof notificador.enviarAlerta !== "function") throw new Error("Notificador inválido.");
    const pct = meta.calcularPercentual();
    const msg = pct >= 100
      ? `🎉 Parabéns! ${d.nome} cumpriu a meta semanal de ${meta.metaMinutosSemana} min.`
      : `${d.nome} está em ${pct.toFixed(1)}% da meta semanal (${meta.minutosCumpridos}/${meta.metaMinutosSemana} min).`;
    return notificador.enviarAlerta(resp.email, msg);
  }
}
