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

  //Get para salas disponiveis naquele dia
  static async getSalasDisponiveisPorData(req, res) {
    const { data } = req.params;

    if (!data) {
      return res.status(400).json({ message: "Data não informada" });
    }

    try {
      const queryTodasSalas = `SELECT id_salas, nome_da_sala, capacidade, localizacao, equipamentos FROM salas`;
      const salas = await new Promise((resolve, reject) => {
        connect.query(queryTodasSalas, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      if (salas.length === 0) {
        return res.status(404).json({ message: "Nenhuma sala cadastrada" });
      }

      const queryReservasDia = `
        SELECT fkid_salas, horario_inicio
        FROM reservas
        WHERE data_reserva = ?
      `;
      const reservas = await new Promise((resolve, reject) => {
        connect.query(queryReservasDia, [data], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      const gerarHorariosPadrao = () => {
        const horarios = [];
        for (let hora = 7; hora < 23; hora++) {
          const inicio = hora.toString().padStart(2, '0') + ":00:00"; // Inclui os segundos
          horarios.push(inicio);
        }
        return horarios;
      };
      const horariosPadrao = gerarHorariosPadrao();

      const salasDisponiveis = [];
      for (const sala of salas) { //faz um loop sobre todas as salas (BCD salas)
        const reservasDaSala = reservas.filter(reserva => reserva.fkid_salas === sala.id_salas) //filtra as reservas de cada sala
          .map(reserva => reserva.horario_inicio); // mapeamento para extrair apenas os horários de início das reservas

        // Verifica se há algum horário padrão que NÃO está nas reservas da sala
        const temHorarioDisponivel = horariosPadrao.some(horarioPadrao =>
          !reservasDaSala.includes(horarioPadrao)
        );//verifica se ao menos 1 horario nao esta reservado

        if (temHorarioDisponivel) {
          salasDisponiveis.push({ //para inserir uma nova sala que esteja ao menos com um horario disponivel
            id_salas: sala.id_salas,
            nome_da_sala: sala.nome_da_sala,
            capacidade: sala.capacidade,
            localizacao: sala.localizacao,
            equipamentos: sala.equipamentos
          });
        }
      }

      if (salasDisponiveis.length === 0) {
        return res.status(404).json({ message: "Nenhuma sala disponível para reserva nessa data" });
      }

      return res.status(200).json({
        message: "Salas disponíveis para reserva",
        data: data,
        salas_disponiveis: salasDisponiveis,
      });

    } catch (error) {
      console.error("Erro ao buscar salas disponíveis:", error);
      return res.status(500).json({ error: "Erro interno ao buscar salas disponíveis" });
    }
  } 

  //Horarios disponiveis naquela sala em um dia especifico  
  static async getSalasHorariosDisponiveis(req, res) {
    const { data } = req.params;
  
    if (!data) {
      return res.status(400).json({ message: "Data não informada" });
    }
  
    try {
      // Buscar todas as salas
      const querySalas = `SELECT id_salas, nome_da_sala FROM salas`;
  
      const salas = await new Promise((resolve, reject) => {
        connect.query(querySalas, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      if (salas.length === 0) {
        return res.status(404).json({ message: "Nenhuma sala cadastrada" });
      }
  
      // Buscar reservas do dia
      const queryReservas = `
        SELECT fkid_salas, horario_inicio, horario_fim
        FROM reservas
        WHERE data_reserva = ?
      `;
  
      const reservas = await new Promise((resolve, reject) => {
        connect.query(queryReservas, [data], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      // Organizar reservas por sala
      const reservasPorSala = {};
      reservas.forEach(reserva => {
        if (!reservasPorSala[reserva.fkid_salas]) {
          reservasPorSala[reserva.fkid_salas] = [];
        }
        reservasPorSala[reserva.fkid_salas].push({
          inicio: reserva.horario_inicio.substring(0, 5), // Pega só HH:MM
          fim: reserva.horario_fim.substring(0, 5),
        });
      });
  
      // Função para gerar TODOS os horários possíveis (07:00 até 22:00)
      const gerarHorariosPadrao = () => {
        const horarios = [];
        for (let hora = 7; hora < 23; hora++) {
          const inicio = hora.toString().padStart(2, '0') + ":00";
          const fim = (hora + 1).toString().padStart(2, '0') + ":00";
          horarios.push({ inicio, fim });
        }
        return horarios;
      };
  
      const horariosPadrao = gerarHorariosPadrao();
  
      // Montar o resultado final
      const resposta = salas.map(sala => {
        const reservasSala = reservasPorSala[sala.id_salas] || [];
  
        // Filtrar horários que já estão reservados
        const horariosDisponiveis = horariosPadrao.filter(horario => {
          return !reservasSala.some(reserva => reserva.inicio === horario.inicio);
        });
  
        return {
          id_sala: sala.id_salas,
          nome_da_sala: sala.nome_da_sala,
          horarios_disponiveis: horariosDisponiveis
        };
      });
  
      return res.status(200).json({
        message: "Salas e horários disponíveis para reserva",
        data: data,
        salas: resposta
      });
  
    } catch (error) {
      console.error("Erro ao buscar horários disponíveis:", error);
      return res.status(500).json({ error: "Erro interno ao buscar horários disponíveis" });
    }
  }
  
};