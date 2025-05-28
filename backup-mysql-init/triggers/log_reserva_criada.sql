DELIMITER //

CREATE TRIGGER log_reserva_criada
AFTER INSERT ON reservas
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
        NEW.id_reserva,
        NEW.fkid_usuario, -- O fkid_usuario é o dono da reserva e quem a criou
        NEW.fkid_salas,
        NEW.data_reserva,
        NEW.horario_inicio,
        NEW.horario_fim,
        'CRIACAO'
    );
END; //

DELIMITER ;