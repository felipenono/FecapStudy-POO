/** MISSÃO 6 — Implementações de INotificador */
class NotificadorEmail extends INotificador {
  obterCanal() { return "E-mail"; }
  enviarAlerta(destinatario, mensagem) {
    if (typeof destinatario !== "string" || !destinatario.includes("@")) { console.warn("📧 E-mail inválido:", destinatario); return false; }
    console.log(`📧 [E-mail → ${destinatario}] ${mensagem}`); return true;
  }
}
class NotificadorWhatsApp extends INotificador {
  obterCanal() { return "WhatsApp"; }
  enviarAlerta(destinatario, mensagem) {
    const num = String(destinatario).replace(/\D/g, "");
    if (num.length < 10) { console.warn("💬 Número inválido:", destinatario); return false; }
    console.log(`💬 [WhatsApp → ${destinatario}] ${mensagem}`); return true;
  }
}
class NotificadorPainel extends INotificador {
  #painel = [];
  obterCanal() { return "Painel"; }
  enviarAlerta(destinatario, mensagem) {
    this.#painel.push({ destinatario, mensagem, quando: new Date().toISOString() });
    console.log(`🖥️ [Painel → ${destinatario}] ${mensagem}`); return true;
  }
  listarAlertas() { return [...this.#painel]; }
}
