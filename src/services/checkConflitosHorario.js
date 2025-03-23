const connect = require("../db/connect"); // Conexão com o banco de dados

const checkConflitoHorario = function (fkid_salas, data_reserva, horario_inicio, horario_fim, id_reserva = null) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT id_reserva FROM reservas
      WHERE fkid_salas = ? 
      AND data_reserva = ? 
      AND (
        (horario_inicio < ? AND horario_fim > ?) OR
        (horario_inicio < ? AND horario_fim > ?) OR
        (horario_inicio >= ? AND horario_inicio < ?) OR
        (horario_fim > ? AND horario_fim <= ?)
      )
    `;

    const values = [
      fkid_salas,
      data_reserva,
      horario_inicio,
      horario_inicio,
      horario_inicio,
      horario_fim,
      horario_inicio,
      horario_fim,
      horario_inicio,
      horario_fim,
    ];

    if (id_reserva) {
      query += " AND id_reserva != ?";
      values.push(id_reserva);
    }

    connect.query(query, values, (err, results) => {
      if (err) return reject({ error: "Erro ao verificar conflito de horário" });
      if (results.length > 0) return resolve({ error: "Conflito de horário encontrado" });
      resolve(null);
    });
  });
};


module.exports = checkConflitoHorario;
