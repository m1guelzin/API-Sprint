const connect = require("../db/connect");

module.exports = class reservaController {
  static async createReserva(req, res) {
  const { id_usuario, fkid_salas, data_hora, duracao } = req.body;

  // Verificar se todos os campos obrigatórios foram preenchidos
  if (!id_usuario || !fkid_salas || !data_hora || !duracao) {
    return res.status(400).json({ error: "Todos os campos devem ser preenchidos" });
  }

  // Verificar se o usuário existe
  const queryUsuario = "SELECT * FROM usuario WHERE id_usuario = ?";
  connect.query(queryUsuario, [id_usuario], function (err, usuario) {
    if (err) {
      console.error("Erro ao verificar usuário: ", err);
      return res.status(500).json({ error: "Erro ao verificar o usuário" });
    }

    if (usuario.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verificar se a sala existe
    const querySala = "SELECT * FROM salas WHERE id_salas = ?";
    connect.query(querySala, [fkid_salas], function (err, sala) {
      if (err) {
        console.error("Erro ao verificar sala: ", err);
        return res.status(500).json({ error: "Erro ao verificar a sala" });
      }

      if (sala.length === 0) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }

      // Verificar se a sala está disponível (disponibilidade = 1)
      if (sala[0].disponibilidade !== 1) {
        return res.status(400).json({ error: "A sala selecionada não está disponível" });
      }
      
      // Ajustando o fuso horário para -3 (Brasil)
      const inicio = new Date(data_hora);
      inicio.setHours(inicio.getHours() - 3); // Subtraindo 3 horas

      const dataFormatada = inicio.toISOString().split("T")[0]; // "2024-12-01"
      const horaFormatada = inicio.toISOString().split("T")[1].split(".")[0]; // "19:30:00"
      const dataHoraFormatada = `${dataFormatada} ${horaFormatada}`;

      // Validação: não permitir reserva para dias anteriores ao atual
      const agora = new Date(); // Data e hora atual
      agora.setHours(agora.getHours() - 3); // Ajusta para o fuso horário -3

      if (inicio < agora) {
        return res
          .status(400)
          .json({ error: "Não é permitido fazer reservas em dias anteriores ao atual." });
      }

      // Verificação da duração máxima de 1 hora
      const [duracaoHoras, duracaoMinutos, duracaoSegundos] = duracao
        .split(":")
        .map(Number);
      
      // Calcular a duração total em minutos
      const duracaoTotalMinutos = duracaoHoras * 60 + duracaoMinutos + (duracaoSegundos ? duracaoSegundos / 60 : 0);
      
      // Se a duração for maior que 60 minutos (1 hora)
      if (duracaoTotalMinutos > 60) {
        return res.status(400).json({ error: "A duração máxima da reserva é de 1 hora." });
      }

      // Cálculo do horário de término
      const duracaoMs =
        ((duracaoHoras * 60 + duracaoMinutos) * 60 + (duracaoSegundos || 0)) * 1000; //obter milissegundos
      const fim = new Date(inicio.getTime() + duracaoMs);

      // Verificando se há conflito de horário para a mesma sala
      const queryConflito = `
        SELECT * FROM reservas
        WHERE fkid_salas = ? 
        AND (
          (? >= data_hora AND ? <= DATE_ADD(data_hora, INTERVAL TIME_TO_SEC(duracao) SECOND)) OR
          (? >= data_hora AND ? <= DATE_ADD(data_hora, INTERVAL TIME_TO_SEC(duracao) SECOND)) OR 
          (data_hora >= ? AND data_hora < ?))`;

      const valuesConflito = [
        fkid_salas,
        dataHoraFormatada, // Início da nova reserva
        dataHoraFormatada,
        fim.toISOString().replace("T", " ").split(".")[0], // Término da nova reserva
        fim.toISOString().replace("T", " ").split(".")[0], dataHoraFormatada,
        fim.toISOString().replace("T", " ").split(".")[0],
      ];

      connect.query(queryConflito, valuesConflito, (err, resultadosConflitos) => {
        if (err) {
          console.error("Erro ao verificar conflitos: ", err);
          return res.status(500).json({ error: "Erro ao verificar conflitos" });
        }

        // Se houver conflitos de horário, retorna erro
        if (resultadosConflitos.length > 0) {
          return res.status(409).json({
            error: "Conflito de horários para a sala selecionada",
          });
        }

        // Se não houver conflitos, realiza a inserção da reserva
        const queryInsert = `
          INSERT INTO reservas (fkid_usuario, fkid_salas, data_hora, duracao)
          VALUES (?, ?, ?, ?)
        `;
        const valuesInsert = [
          id_usuario,
          fkid_salas,
          dataHoraFormatada,
          duracao,
        ];

        connect.query(queryInsert, valuesInsert, (err, result) => {
          if (err) {
            console.error("Erro ao criar reserva: ", err);
            return res.status(500).json({ error: "Erro ao criar reserva" });
          }

          return res.status(201).json({
            message: "Reserva criada com sucesso",
            reservaId: result.insertId,
          });
        });
      });
    });
  });
}



static async getReservas(req, res) {
  const querySelect = `
    SELECT r.id_reserva, r.fkid_usuario, r.fkid_salas, r.data_hora, r.duracao, u.nome AS usuario_nome, s.nome_da_sala AS sala_nome
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
        if (reserva.data_hora instanceof Date) {
          // Ajustar a data/hora subtraindo 3 horas
          const dataHoraAjustada = new Date(reserva.data_hora);
          dataHoraAjustada.setHours(dataHoraAjustada.getHours() - 3);
          
          // Converter para string no formato desejado
          reserva.data_hora = dataHoraAjustada.toISOString().replace("T", " ").split(".")[0];
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
    const { id_reserva, fkid_salas, data_hora, duracao } = req.body;
  
    if (!id_reserva || !fkid_salas || !data_hora || !duracao) {
      return res.status(400).json({ error: "Todos os campos devem ser preenchidos" });
    }
  
    // Verificando se a reserva existe
    const queryReserva = `SELECT * FROM reservas WHERE id_reserva = ?`;
    connect.query(queryReserva, [id_reserva], (err, reserva) => {
      if (err) {
        console.error("Erro ao verificar a reserva: ", err);
        return res.status(500).json({ error: "Erro ao verificar a reserva" });
      }
      if (reserva.length === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }
  
      // Verificando se a sala está disponível
      const queryDisponibilidade = `SELECT disponibilidade FROM salas WHERE id_salas = ?`;
      connect.query(queryDisponibilidade, [fkid_salas], (err, results) => {
        if (err) {
          console.error("Erro ao verificar disponibilidade: ", err);
          return res.status(500).json({ error: "Erro ao verificar disponibilidade da sala" });
        }
        if (results.length === 0 || results[0].disponibilidade === 0) {
          return res.status(400).json({ error: "A sala selecionada não está disponível." });
        }
  
        // Ajustando o fuso horário para -3 (Brasil)
        const inicio = new Date(data_hora);
        inicio.setHours(inicio.getHours() - 3); // Subtraindo 3 horas para ajustar para o fuso horário Brasil
  
        const agora = new Date();
        agora.setHours(agora.getHours() - 3); // Ajustando para o fuso horário -3
  
        // Validação de data no passado
        if (inicio < agora) {
          return res.status(400).json({ error: "Não é permitido atualizar para uma data no passado." });
        }
  
        const dataFormatada = inicio.toISOString().split("T")[0];
        const horaFormatada = inicio.toISOString().split("T")[1].split(".")[0];
        const dataHoraFormatada = `${dataFormatada} ${horaFormatada}`;
  
        // Cálculo do horário de término
        const [duracaoHoras, duracaoMinutos, duracaoSegundos] = duracao.split(":").map(Number);
        const duracaoTotalMinutos = duracaoHoras * 60 + duracaoMinutos + (duracaoSegundos ? duracaoSegundos / 60 : 0);
  
        // Validação: duração máxima de uma hora
        if (duracaoTotalMinutos > 60) {
          return res.status(400).json({ error: "A duração máxima da reserva é de 1 hora." });
        }
  
        const duracaoMs = ((duracaoHoras * 60 + duracaoMinutos) * 60 + (duracaoSegundos || 0)) * 1000;
        const fim = new Date(inicio.getTime() + duracaoMs);
  
        // Verificando se há conflito de horário para a mesma sala
        const queryConflito = `
          SELECT * FROM reservas
          WHERE id_reserva != ? AND fkid_salas = ? 
          AND (
            (? >= data_hora AND ? < DATE_ADD(data_hora, INTERVAL duracao SECOND)) OR
            (? < data_hora AND DATE_ADD(?, INTERVAL duracao SECOND) > data_hora)
          )
        `;
        const valuesConflito = [
          id_reserva, // Exclui a própria reserva do conflito
          fkid_salas, // Sala que está sendo reservada
          dataHoraFormatada, // Início da nova reserva
          dataHoraFormatada,
          fim.toISOString().replace("T", " ").split(".")[0], // Término da nova reserva
          fim.toISOString().replace("T", " ").split(".")[0], // Término da nova reserva
        ];
  
        connect.query(queryConflito, valuesConflito, (err, resultadosConflitos) => {
          if (err) {
            console.error("Erro ao verificar conflitos: ", err);
            return res.status(500).json({ error: "Erro ao verificar conflitos" });
          }
  
          // Se houver conflitos de horário, retorna erro
          if (resultadosConflitos.length > 0) {
            return res.status(409).json({
              error: "Conflito de horários para a sala selecionada",
            });
          }
  
          // Se não houver conflitos, realiza a atualização da reserva
          const queryUpdate = `
            UPDATE reservas
            SET fkid_salas = ?, data_hora = ?, duracao = ?
            WHERE id_reserva = ?
          `;
          const valuesUpdate = [fkid_salas, dataHoraFormatada, duracao, id_reserva];
  
          connect.query(queryUpdate, valuesUpdate, (err, results) => {
            if (err) {
              console.error("Erro ao atualizar reserva: ", err);
              return res.status(500).json({ error: "Erro ao atualizar reserva" });
            }
            if (results.affectedRows === 0) {
              return res.status(404).json({ message: "Reserva não encontrada" });
            }
  
            return res.status(200).json({ message: "Reserva atualizada com sucesso" });
          });
        });
      });
    });
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
