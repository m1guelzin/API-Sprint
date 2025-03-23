const connect = require("../db/connect");
const ValidateSala = require("../services/validateSala")

module.exports = class salasController {
  
  // Criar uma nova sala
  static async createSala(req, res) {
    try {
      const validation = await ValidateSala.validate(req.body);

      if (validation.error) {
        return res.status(400).json(validation);
      }

      const { nome_da_sala, capacidade, localizacao, equipamentos } = req.body;
      const queryInsert = "INSERT INTO salas (nome_da_sala, capacidade, localizacao, equipamentos) VALUES (?, ?, ?, ?)";
      const values = [nome_da_sala, capacidade, localizacao, equipamentos];

      connect.query(queryInsert, values, function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao cadastrar a sala, verifique os dados" });
        }
        return res.status(201).json({ message: "Sala cadastrada com sucesso" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }


  // Listar todas as salas
  static async getAllSalas(req, res) {
    const query = "SELECT * FROM salas";

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
    try {
      const { id_salas, nome_da_sala, capacidade, localizacao, equipamentos } = req.body;

      if (!id_salas) {
        return res.status(400).json({ error: "O ID da sala é obrigatório" });
      }

      const validation = await ValidateSala.validate(req.body, id_salas);
      if (validation.error) {
        return res.status(400).json(validation);
      }

      // Atualizar sala
      const queryUpdate = "UPDATE salas SET nome_da_sala=?, capacidade=?, localizacao=?, equipamentos=? WHERE id_salas = ?";
      const values = [nome_da_sala, capacidade, localizacao, equipamentos, id_salas];

      connect.query(queryUpdate, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao atualizar a sala" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Sala não encontrada" });
        }
        return res.status(200).json({ message: "Sala atualizada com sucesso" });
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
    const queryCheckReservas = "SELECT COUNT(*) AS quantidade_reservas_na_sala FROM reservas WHERE fkid_salas = ?";
    const queryDelete = "DELETE FROM salas WHERE id_salas = ?";
  
    try {
      // Verifica se há reservas associadas à sala
      connect.query(queryCheckReservas, [salaId], function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao verificar reservas associadas à sala" });
        }
  
        const { quantidade_reservas_na_sala } = results[0];
        if (quantidade_reservas_na_sala > 0) {
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