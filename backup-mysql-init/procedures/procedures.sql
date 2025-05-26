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
-- call ListarReservasPorData("2026-03-28");


DELIMITER $$

CREATE PROCEDURE ListarReservasPorUsuario(IN p_id_usuario INT)
BEGIN
  SELECT
    r.id_reserva,
    u.nome,
    s.nome_da_sala AS "Sala Reservada",
    r.data_reserva,
    r.horario_inicio,
    r.horario_fim
  FROM reservas r
  JOIN usuario u ON r.fkid_usuario = u.id_usuario
  JOIN salas s ON r.fkid_salas = s.id_salas
  WHERE r.fkid_usuario = p_id_usuario
  ORDER BY r.data_reserva, r.horario_inicio;
END$$

DELIMITER ;
-- call ListarReservasPorUsuario(1);