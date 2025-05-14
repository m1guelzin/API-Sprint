const connect = require("../db/connect");
const validateIds = require('../services/validateIds'); // Importe o service de validação (atenção ao nome do arquivo)

const reservaService = {
  async listarReservasPorUsuario(idUsuario) {
    const queryCallProcedure = `CALL ListarReservasPorUsuario(?)`;
    try {
      const [results] = await connect.promise().query(queryCallProcedure, [idUsuario]);
      return results;
    } catch (error) {
      console.error("Erro ao buscar reservas no banco de dados:", error);
      throw error; // Propaga o erro para o controller tratar
    }
  },

  async verificarUsuarioExistente(idUsuario) {
    const result = await validateIds.checkUserExists(idUsuario);
    return result === null; // Retorna true se não houver erro (usuário existe)
  }
};

module.exports = reservaService;