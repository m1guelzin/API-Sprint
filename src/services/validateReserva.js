module.exports = function validateReserva({
  fkid_usuario,
  fkid_salas,
  data_reserva,
  horario_inicio,
  horario_fim
}) {
      // Verificar se todos os campos foram preenchidos
      if (!fkid_usuario || !fkid_salas || !data_reserva || !horario_inicio || !horario_fim) {
        return { error: "Todos os campos devem ser preenchidos" };
      }
  
          // Validar formato da data (AAAA-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data_reserva)) {
      return { error: "Formato da data inválido. Use AAAA-MM-DD" };
    }

    // Validar horário de forma mais simples
    const validateTimeFormat = (time) => {
      const parts = time.split(":");
      if (parts.length !== 3) return false; // Deve ter 3 partes (HH, MM, SS)

      const [hours, minutes, seconds] = parts;

      // Verificar se a hora, minuto e segundo são números válidos
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return false;

      const h = parseInt(hours);
      const m = parseInt(minutes);
      const s = parseInt(seconds);

      // Verificar se a hora está entre 00 e 23, minutos e segundos entre 00 e 59
      return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59;
    };

    if (!validateTimeFormat(horario_inicio) || !validateTimeFormat(horario_fim)) {
      return { error: "Formato do horário inválido. Use HH:MM:SS" };
    }
  
      // Converter horários para objetos Date
      const hoje = new Date().toISOString().split('T')[0]; // Data atual formatada
      const inicioDate = new Date(`${data_reserva}T${horario_inicio}`);
      const fimDate = new Date(`${data_reserva}T${horario_fim}`);
  
      // Validar se a data e horário são válidos
      if (data_reserva < hoje) {
        return { error: "A data da reserva não pode estar no passado" };
      }
      if (fimDate <= inicioDate) {
        return { error: "O horário final deve ser maior que o horário inicial" };
      }
  
      // Verificar se está dentro do horário permitido (7h - 23h)
      const inicioHour = inicioDate.getHours();
      const fimHour = fimDate.getHours();
      if (inicioHour < 7 || inicioHour >= 23 || fimHour < 7 || fimHour > 23) {
        return { error: "A reserva deve ser feita entre 7:00 e 23:00" };
      }
  
      // Verificar se a reserva tem exatamente 1 hora de duração
      const duration = fimDate - inicioDate;
      const limit = 60 * 60 * 1000; // 1 hora em milissegundos
      if (duration !== limit) {
        return { error: "A reserva deve ter exatamente 1 hora de duração" };
      }
  
      return null; // Retorna null se não houver erro
    }


