/** Interface (contrato) de notificação. */
class INotificador {
  obterCanal() { throw new Error("INotificador.obterCanal() não implementado."); }
  enviarAlerta(destinatario, mensagem) { throw new Error("INotificador.enviarAlerta() não implementado."); }
}
