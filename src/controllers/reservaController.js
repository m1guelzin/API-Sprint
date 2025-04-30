const connect = require("../db/connect");
const validateReserva = require("../services/validateReserva");
const checkConflitoHorario = require("../services/checkConflitosHorario");
const validateIds = require("../services/validateIds")

module.exports = class reservaController {
  static async createReserva(req, res) {
    const { id_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim } = req.body;
    
  
    // Validar os dados recebidos
    const validationResult = validateReserva({
      fkid_usuario: id_usuario,
      fkid_salas,
      data_reserva,
      horario_inicio,
      horario_fim
    });

    const idValidation = await validateIds(id_usuario, fkid_salas);
    if (idValidation) {
      return res.status(400).json(idValidation);
    }

  
    if (validationResult) {
      return res.status(400).json(validationResult);
    }
  
    try {
      // Verificar conflito de horário
      const conflito = await checkConflitoHorario(fkid_salas, data_reserva, horario_inicio, horario_fim);
      if (conflito) {
        return res.status(400).json(conflito);
      }
  
      // Query para inserir reserva
      const query = `
        INSERT INTO reservas (fkid_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim)
        VALUES (?, ?, ?, ?, ?)
      `;
  
      const values = [id_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim];
  
      const result = await new Promise((resolve, reject) => {
        connect.query(query, values, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      return res.status(201).json({
        message: "Reserva criada com Sucesso!!",
        id_reserva: result.insertId
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar reserva, tente novamente mais tarde." });
    }
  }
  
  



static async getReservas(req, res) {
  const querySelect = `
    SELECT r.id_reserva, r.fkid_usuario, r.fkid_salas, r.data_reserva, r.horario_inicio, r.horario_fim, 
           u.nome AS usuario_nome, s.nome_da_sala AS sala_nome
    FROM reservas r
    INNER JOIN usuario u ON r.fkid_usuario = u.id_usuario
    INNER JOIN salas s ON r.fkid_salas = s.id_salas
  `;

  try {
    connect.query(querySelect, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar reservas" });
      }

      // Ajustar o horário para o fuso horário do Brasil (UTC-3)
      const reservasFormatadas = results.map(reserva => {
        // Ajuste da data (data_reserva) para o fuso horário
        if (reserva.data_reserva instanceof Date) {
          const dataReservaAjustada = new Date(reserva.data_reserva);
          dataReservaAjustada.setHours(dataReservaAjustada.getHours() - 3);
          reserva.data_reserva = dataReservaAjustada.toISOString().split("T")[0];
        }

        // Ajustar o horário de início (horario_inicio) e fim (horario_fim) para o fuso horário
        if (reserva.horario_inicio instanceof Date) {
          const horarioInicioAjustado = new Date(reserva.horario_inicio);
          horarioInicioAjustado.setHours(horarioInicioAjustado.getHours() - 3);
          reserva.horario_inicio = horarioInicioAjustado.toISOString().split("T")[1].split(".")[0];
        }

        if (reserva.horario_fim instanceof Date) {
          const horarioFimAjustado = new Date(reserva.horario_fim);
          horarioFimAjustado.setHours(horarioFimAjustado.getHours() - 3);
          reserva.horario_fim = horarioFimAjustado.toISOString().split("T")[1].split(".")[0];
        }

        return reserva;
      });

      return res
        .status(200)
        .json({ message: "Lista de Reservas", reservas: reservasFormatadas });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

static async getReservasByUser(req, res) {
  const { id_usuario } = req.params;

  const queryCheckUser = `SELECT id_usuario FROM usuario WHERE id_usuario = ?`;
  const querySelect = `
    SELECT 
      r.id_reserva, 
      u.nome AS nome_usuario, 
      s.nome_da_sala, 
      r.data_reserva, 
      r.horario_inicio
    FROM reservas r
    INNER JOIN salas s ON r.fkid_salas = s.id_salas
    INNER JOIN usuario u ON r.fkid_usuario = u.id_usuario
    WHERE r.fkid_usuario = ?
  `;

  try {
    // Verifica se o usuário existe
    const userResults = await new Promise((resolve, reject) => {
      connect.query(queryCheckUser, [id_usuario], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (userResults.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Busca reservas do usuário
    const results = await new Promise((resolve, reject) => {
      connect.query(querySelect, [id_usuario], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ message: "Nenhuma reserva encontrada para este usuário" });
    }

    // Formatar data/hora corretamente
    const reservasFormatadas = results.map(reserva => ({
      id_reserva: reserva.id_reserva,
      nome_usuario: reserva.nome_usuario,
      nome_da_sala: reserva.nome_da_sala,
      data_reserva: reserva.data_reserva
        ? new Date(reserva.data_reserva).toISOString().split("T")[0] // Apenas a data (YYYY-MM-DD)
        : null,
      horario_inicio: reserva.horario_inicio
        ? reserva.horario_inicio.substring(0, 5) // Formatar HH:MM
        : null,
    }));

    return res.status(200).json({
      message: "Reservas do usuário",
      reservas: reservasFormatadas,
    });

  } catch (error) {
    console.error("Erro no banco de dados:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

  static async deleteReserva(req, res) {
    const { id_reserva } = req.params;

    // 1. Verificar se a reserva existe
    const queryReserva = `SELECT * FROM reservas WHERE id_reserva = ?`;

    connect.query(queryReserva, [id_reserva], (err, reserva) => {
      if (err) {
        console.error("Erro ao verificar a reserva: ", err);
        return res.status(500).json({ error: "Erro ao verificar a reserva" });
      }

      // Se a reserva não existir, retorna erro 404
      if (reserva.length === 0) {
        return res.status(404).json({ message: "Reserva não encontrada" });
      }

      // Se a reserva existir, pode prosseguir com a exclusão
      const queryDelete = `DELETE FROM reservas WHERE id_reserva = ?`;
      const valuesDelete = [id_reserva];

      try {
        connect.query(queryDelete, valuesDelete, (err, results) => {
          if (err) {
            console.error("Erro ao excluir a reserva: ", err);
            return res.status(500).json({ error: "Erro ao excluir reserva" });
          }

          // Verifica se alguma linha foi excluída
          if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Reserva não encontrada" });
          }

          return res.status(200).json({ message: "Reserva excluída com sucesso" });
        });
      } catch (error) {
        console.error("Erro interno: ", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }
    });
  }
};


