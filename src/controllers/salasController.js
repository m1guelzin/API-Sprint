const connect = require("../db/connect");

module.exports = class salasController {
  
  // Criar uma nova sala
  static async createSala(req, res) {
    const { nome_da_sala, capacidade, localizacao, disponibilidade, equipamentos } = req.body;

    if (!nome_da_sala || !capacidade || !localizacao || disponibilidade === undefined || !equipamentos) {
        return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
    }

    const queryCheck = `SELECT * FROM salas WHERE nome_da_sala = ?`;
    const queryInsert = `INSERT INTO salas (nome_da_sala, capacidade, localizacao, disponibilidade, equipamentos) VALUES (?, ?, ?, ?, ?)`;
    const values = [nome_da_sala, capacidade, localizacao, disponibilidade, equipamentos];

    try {
        // Verificar se já existe uma sala com o mesmo nome
        connect.query(queryCheck, [nome_da_sala], function (err, results) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erro ao verificar o nome da sala" });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: "Já existe uma sala cadastrada com este nome" });
            }

            // Inserir a sala no banco de dados
            connect.query(queryInsert, values, function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Erro ao cadastrar a sala" });
                }
                return res.status(201).json({ message: "Sala cadastrada com sucesso" });
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}

  // Listar todas as salas
  static async getAllSalas(req, res) {
    const query = `SELECT * FROM salas`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao listar as salas" });
        }
        return res.status(200).json({ message: "Lista de Salas", salas: results });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // Atualizar uma sala
  static async updateSala(req, res) {
    const { id_salas, nome_da_sala, capacidade, localizacao, disponibilidade, equipamentos } = req.body;
  
    // Verificar campos obrigatórios
    if (!id_salas || !nome_da_sala || !capacidade || !localizacao || disponibilidade === undefined) {
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos" });
    }
  
    // Consulta para verificar se já existe outra sala com o mesmo nome
    const checkQuery = `SELECT * FROM salas WHERE nome_da_sala = ? AND id_salas != ?`;
    try {
      connect.query(checkQuery, [nome_da_sala, id_salas], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao verificar nome da sala" });
        }
  
        // Se encontrar um resultado, significa que o nome já existe
        if (results.length > 0) {
          return res.status(400).json({ error: "O nome da sala já está em uso" });
        }
  
        // Atualização da sala
        const queryUpdate = `UPDATE salas SET nome_da_sala=?, capacidade=?, localizacao=?, disponibilidade=?, equipamentos=? WHERE id_salas = ?`;
        const values = [nome_da_sala, capacidade, localizacao, disponibilidade, equipamentos, id_salas];
  
        connect.query(queryUpdate, values, function (err, results) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao atualizar a sala" });
          }
          if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Sala não encontrada" });
          }
          return res.status(200).json({ message: "Sala atualizada com sucesso" });
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // Excluir uma sala
  static async deleteSala(req, res) {
    const salaId = req.params.id;
  
    // Query para verificar se existem reservas associadas à sala
    const queryCheckReservas = `SELECT COUNT(*) AS quantidade_reservas_na_sala FROM reservas WHERE fkid_salas = ?`;
    const queryDelete = `DELETE FROM salas WHERE id_salas = ?`;
  
    try {
      // Verifica se há reservas associadas à sala
      connect.query(queryCheckReservas, [salaId], function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao verificar reservas associadas à sala" });
        }
  
        const { reservaCount } = results[0];
        if (reservaCount > 0) {
          return res.status(400).json({ error: "Não é possível excluir a sala, pois ela possui reservas associadas" });
        }
  
        // Se não houver reservas, tenta excluir a sala
        connect.query(queryDelete, [salaId], function (err, results) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao excluir a sala" });
          }
          if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Sala não encontrada" });
          }
          return res.status(200).json({ message: "Sala excluída com sucesso" });
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
