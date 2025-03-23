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
        message: "Reserva criada com sucesso",
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

  // Query para verificar a existência do usuário
  const queryCheckUser = `SELECT id_usuario FROM usuario WHERE id_usuario = ?`;
  const valuesCheckUser = [id_usuario];

  // Query para buscar reservas do usuário
  const querySelect = `
    SELECT r.id_reserva, s.nome_da_sala, r.data_hora, r.duracao
    FROM reservas r
    INNER JOIN salas s ON r.fkid_salas = s.id_salas
    WHERE r.fkid_usuario = ?
  `;
  const valuesSelect = [id_usuario];

  try {
    // Verificar se o usuário existe
    connect.query(queryCheckUser, valuesCheckUser, (err, userResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao verificar existência do usuário" });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Buscar reservas do usuário
      connect.query(querySelect, valuesSelect, (err, results) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Erro ao buscar reservas do usuário" });
        }

        // Verificar se o usuário possui reservas
        if (results.length === 0) {
          return res.status(404).json({ message: "Nenhuma reserva encontrada para este usuário" });
        }

        // Formatar data/hora diretamente
        const reservasFormatadas = results.map(reserva => {
          if (reserva.data_hora) {
            // Ajustar o horário para UTC-3 e formatar
            const dataHora = new Date(reserva.data_hora);
            dataHora.setHours(dataHora.getHours() - 3);
            reserva.data_hora = dataHora
              .toISOString()
              .replace("T", " ")
              .split(".")[0]; // Remover milissegundos
          }
          return reserva;
        });

        return res
          .status(200)
          .json({ message: "Reservas do usuário", reservas: reservasFormatadas });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}


static async updateReserva(req, res) {
  const { id_reserva } = req.body;
  const { id_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim } = req.body;

  // Validar os dados recebidos
  const validationResult = validateReserva({
    fkid_usuario: id_usuario,
    fkid_salas,
    data_reserva,
    horario_inicio,
    horario_fim
  });

  if (validationResult) {
    return res.status(400).json(validationResult);
  }

  // Verificar se os IDs do usuário e da sala existem
  const idValidation = await validateIds(id_usuario, fkid_salas);
  if (idValidation) {
    return res.status(400).json(idValidation);
  }

  try {
    // Verificar se a reserva existe
    const reservaExists = await new Promise((resolve, reject) => {
      connect.query(
        "SELECT * FROM reservas WHERE id_reserva = ?",
        [id_reserva],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0);
        }
      );
    });

    if (!reservaExists) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }

    // Verificar conflito de horário antes de atualizar a reserva
    const conflito = await checkConflitoHorario(fkid_salas, data_reserva, horario_inicio, horario_fim, id_reserva);
    if (conflito) {
      return res.status(400).json(conflito);
    }

    // Atualizar a reserva no banco de dados
    const query = `
      UPDATE reservas
      SET fkid_usuario = ?, fkid_salas = ?, data_reserva = ?, horario_inicio = ?, horario_fim = ?
      WHERE id_reserva = ?
    `;

    const values = [id_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim, id_reserva];

    await new Promise((resolve, reject) => {
      connect.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    return res.status(200).json({ message: "Reserva atualizada com sucesso" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar reserva, tente novamente mais tarde." });
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
