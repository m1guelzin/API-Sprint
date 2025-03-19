module.exports = {
    validateReserva: function ({ fkid_usuario, fkid_salas, data_reserva, horario_inicio, horario_fim }) {
      // Verificar se todos os campos foram preenchidos
      if (!fkid_usuario || !fkid_salas || !data_reserva || !horario_inicio || !horario_fim) {
        return { error: "Todos os campos devem ser preenchidos" };
      }
  
      // Validar formato dos valores recebidos
      if (isNaN(fkid_usuario) || isNaN(fkid_salas)) {
        return { error: "IDs de usuário e sala devem ser números válidos" };
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data_reserva)) {
        return { error: "Formato da data inválido. Use AAAA-MM-DD" };
      }
      if (!/^\d{2}:\d{2}$/.test(horario_inicio) || !/^\d{2}:\d{2}$/.test(horario_fim)) {
        return { error: "Formato do horário inválido. Use HH:MM" };
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
    },

}