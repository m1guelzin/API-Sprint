const connect = require("../db/connect");
const validateIds = require("../services/validateIds");

const reservaService = {
  async listarReservasPorUsuario(idUsuario) {
    const queryCallProcedure = `CALL ListarReservasPorUsuario(?)`;
    try {
      // MODIFICAÇÃO AQUI: Acessar o primeiro elemento do array de resultados da procedure
      const [results] = await connect.promise().query(queryCallProcedure, [
        idUsuario,
      ]);
      return results[0]; // Isso garante que você pegue o array de objetos das suas reservas
    } catch (error) {
      console.error("Erro ao buscar reservas no banco de dados:", error);
      throw error; // Propaga o erro para o controller tratar
    }
  },

  async verificarUsuarioExistente(idUsuario) {
    const result = await validateIds.checkUserExists(idUsuario);
    // Se checkUserExists retorna null, o usuário existe (result === null é true)
    // Se checkUserExists retorna { error: ... }, o usuário não existe (result === null é false)
    return result === null;
  },
};

module.exports = reservaService;