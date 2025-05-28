DELIMITER //

CREATE TRIGGER log_reserva_deletada
AFTER DELETE ON reservas
FOR EACH ROW
BEGIN
    INSERT INTO reservas_log (
        id_reserva,
        fkid_usuario_reserva,
        fkid_salas,
        data_reserva,
        horario_inicio,
        horario_fim,
        tipo_evento
    )
    VALUES (
        OLD.id_reserva,
        OLD.fkid_usuario, -- O fkid_usuario é o dono da reserva e quem a deletou
        OLD.fkid_salas,
        OLD.data_reserva,
        OLD.horario_inicio,
        OLD.horario_fim,
        'EXCLUSAO'
    );
END; //

DELIMITER ;