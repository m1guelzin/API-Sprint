const connect = require("../db/connect");

class ValidateSala {
  static async validate(data) {
    const { nome_da_sala, capacidade, localizacao, equipamentos } = data;

    if (!nome_da_sala || !capacidade || !localizacao || !equipamentos) {
      return { error: "Todos os campos obrigatórios devem ser preenchidos" };
    }

    if (typeof nome_da_sala !== "string" || nome_da_sala.trim().length === 0) {
      return { error: "Nome da sala inválido" };
    }

    if (typeof capacidade !== "number" || capacidade <= 0) {
      return { error: "Capacidade deve ser um número positivo" };
    }

    if (typeof localizacao !== "string" || localizacao.trim().length === 0) {
      return { error: "Localização inválida" };
    }

    if (typeof equipamentos !== "string" || equipamentos.trim().length === 0) {
      return { error: "Equipamentos inválidos" };
    }

    // Verificar se a sala já existe no banco de dados
    const queryCheck = "SELECT * FROM salas WHERE nome_da_sala = ?";

    return new Promise((resolve, reject) => {
      connect.query(queryCheck, [nome_da_sala], (err, results) => {
        if (err) {
          console.error(err);
          return reject({ error: "Erro ao verificar o nome da sala" });
        }

        if (results.length > 0) {
          return resolve({ error: "Já existe uma sala cadastrada com este nome" });
        }

        return resolve({ error: null }); // Se passar em todas as validações, não há erro
      });
    });
  }
}
  
  module.exports = ValidateSala;
  