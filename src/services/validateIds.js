const db = require("../db/connect");

// Função para verificar se o usuário existe
const checkUserExists = (fkid_usuario) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
      [fkid_usuario],
      (err, results) => {
        if (err) return reject({ error: "Erro ao verificar usuário" });
        if (results.length === 0) return resolve({ error: "Usuário não encontrado" });
        resolve(null); // Usuário encontrado
      }
    );
  });
};

// Função para verificar se a sala existe
const checkSalaExists = (fkid_salas) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id_salas FROM salas WHERE id_salas = ?",
      [fkid_salas],
      (err, results) => {
        if (err) return reject({ error: "Erro ao verificar sala" });
        if (results.length === 0) return resolve({ error: "Sala não encontrada" });
        resolve(null); // Sala encontrada
      }
    );
  });
};

// Função para validar os IDs antes de criar a reserva
const validateIds = async (fkid_usuario, fkid_salas) => {
  try {
    const userValidation = await checkUserExists(fkid_usuario);
    if (userValidation) return userValidation;

    const salaValidation = await checkSalaExists(fkid_salas);
    if (salaValidation) return salaValidation;

    return null; // Tudo certo
  } catch (error) {
    return error;
  }
};

module.exports = {
  checkUserExists,
  validateIds,
};