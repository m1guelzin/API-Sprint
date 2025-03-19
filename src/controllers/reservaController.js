const connect = require("../db/connect");
const validateReserva = require("../services/validateReserva");

module.exports = class reservaController {
  static async createReserva(req, res) {
    const { id_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim } = req.body;
  
    // Criar as datas completas para o início e o fim
    const dataInicio = new Date(`${data_reserva}T${horario_inicio}`);
    const dataFim = new Date(`${data_reserva}T${horario_fim}`);
  
    // Verificar se as datas são válidas
    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      return res.status(400).json({ error: "Data ou hora inválida" });
    }
  
    // Extrair data e hora separadas de datahora_inicio e datahora_fim
    const data_reserva_formatada = dataInicio.toISOString().split("T")[0];  // Data (YYYY-MM-DD)
    const horario_inicio_formatado = dataInicio.toISOString().split("T")[1].split(".")[0];  // Hora no formato HH:mm:ss
    const horario_fim_formatado = dataFim.toISOString().split("T")[1].split(".")[0];  // Hora no formato HH:mm:ss
  
    // Validação dos campos
    const validationError = await validateReserva.validateReserva({
      fkid_usuario: id_usuario,  // ID do usuário
      fkid_salas,                // ID da sala
      data_reserva: data_reserva_formatada, // Data da reserva
      horario_inicio: horario_inicio_formatado,  // Hora de início
      horario_fim: horario_fim_formatado,  // Hora de término
    });
  
    if (validationError) {
      return res.status(400).json(validationError);
    }
  
    try {
      // Verifica se o usuário existe
      const userExists = await validateReserva.checkUserExists(id_usuario);
      if (userExists) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      // Verifica se a sala existe
      const salaExists = await validateReserva.checkSalaExists(fkid_salas);
      if (!salaExists) {
        return res.status(404).json({ error: "Sala não encontrada" });
      }
  
      // Verifica conflitos de horário para a sala
      const conflitos = await validateReserva.checkConflitoHorario(fkid_salas, dataInicio, dataFim);
      if (conflitos.length > 0) {
        const reservasOrdenadas = conflitos.sort(
          (a, b) => new Date(a.datahora_fim) - new Date(b.datahora_fim)
        );
        const proximoHorarioInicio = new Date(reservasOrdenadas[0].datahora_fim);
        proximoHorarioInicio.setHours(proximoHorarioInicio.getHours() - 3);  // Ajuste para a hora de intervalo
        const proximoHorarioFim = new Date(proximoHorarioInicio.getTime() + 50 * 60 * 1000);  // Duração de 50 minutos
        return res.status(400).json({
          error: `A sala já está reservada neste horário. O próximo horário disponível é de ${proximoHorarioInicio
            .toISOString()
            .replace("T", " ")
            .substring(0, 19)} até ${proximoHorarioFim
            .toISOString()
            .replace("T", " ")
            .substring(0, 19)}`,
        });
      }
  
      // Insere a nova reserva no banco de dados
      const queryInsert = `
        INSERT INTO reservas (fkid_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [id_usuario, fkid_salas, data_reserva_formatada, horario_inicio_formatado, horario_fim_formatado];
  
      connect.query(queryInsert, values, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao criar a reserva" });
        }
        return res.status(201).json({ message: "Reserva criada com sucesso" });
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
  
  



static async getReservas(req, res) {
  const querySelect = `
    SELECT r.id_reserva, r.fkid_usuario, r.fkid_salas, r.data_reserva, r.horario_inicio, r.horario_fim, 
           u.nome AS usuario_nome, s.nome_da_sala AS sala_nome
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
        // Ajuste da data (data_reserva) para o fuso horário
        if (reserva.data_reserva instanceof Date) {
          const dataReservaAjustada = new Date(reserva.data_reserva);
          dataReservaAjustada.setHours(dataReservaAjustada.getHours() - 3);
          reserva.data_reserva = dataReservaAjustada.toISOString().split("T")[0];
        }

        // Ajustar o horário de início (horario_inicio) e fim (horario_fim) para o fuso horário
        if (reserva.horario_inicio instanceof Date) {
          const horarioInicioAjustado = new Date(reserva.horario_inicio);
          horarioInicioAjustado.setHours(horarioInicioAjustado.getHours() - 3);
          reserva.horario_inicio = horarioInicioAjustado.toISOString().split("T")[1].split(".")[0];
        }

        if (reserva.horario_fim instanceof Date) {
          const horarioFimAjustado = new Date(reserva.horario_fim);
          horarioFimAjustado.setHours(horarioFimAjustado.getHours() - 3);
          reserva.horario_fim = horarioFimAjustado.toISOString().split("T")[1].split(".")[0];
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
