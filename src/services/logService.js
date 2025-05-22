const connect = require("../db/connect"); // Assumindo que seu arquivo de conexão está em ../db/connect

const logService = {
  // Função para registrar um log de evento
  async registrarLog(
    idReserva,
    idUsuario,
    nomeSala,
    dataReserva,
    horarioInicio,
    horarioFim,
    acao,
    mensagem
  ) {
    const query = `
      INSERT INTO log_evento (
        id_reserva_afetada,
        id_usuario_afetado,
        nome_sala_afetada,
        data_reserva_afetada,
        horario_inicio_afetado,
        horario_fim_afetado,
        acao,
        mensagem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      await connect.promise().query(query, [
        idReserva,
        idUsuario,
        nomeSala,
        dataReserva,
        horarioInicio,
        horarioFim,
        acao,
        mensagem,
      ]);
    } catch (error) {
      // É importante apenas logar o erro aqui, sem relançar,
      // para não impedir a operação principal (criar/deletar reserva).
      console.error("Erro ao registrar log no banco de dados:", error);
    }
  }
};

module.exports = logService;