DELIMITER $$

CREATE PROCEDURE ListarReservasPorData(IN p_data DATE)
BEGIN
  SELECT 
  r.id_reserva, 
  u.nome, 
  s.nome_da_sala as "Sala Reservada", 
  r.horario_inicio,     
  r.horario_fim
  FROM reservas r
  JOIN usuario u ON r.fkid_usuario = u.id_usuario
  JOIN salas s ON r.fkid_salas = s.id_salas
  WHERE r.data_reserva = p_data
  ORDER BY u.nome, s.nome_da_sala;
END$$

DELIMITER ;
