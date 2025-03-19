const db = require('../db/connect'); // Conexão com o banco de dados

const checkConflitoHorario = function (fkid_salas, data_reserva, horario_inicio, horario_fim) {
  if (!fkid_salas || !data_reserva || !horario_inicio || !horario_fim) {
    return { error: "Todos os campos devem ser preenchidos" };
  }

  const query = `
    SELECT data_reserva, horario_inicio, horario_fim FROM reservas
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

  db.query(query, values, (err, results) => {
    if (err) {
      return { error: "Erro ao verificar conflito de horário" };
    }
    if (results.length > 0) {
      return { error: "Conflito de horário encontrado" };
    }
    return null; // Nenhum erro encontrado
  });
};

module.exports = checkConflitoHorario;
