DELIMITER $$

CREATE FUNCTION total_reservas_por_sala(idSala INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM reservas
    WHERE fkid_salas = idSala;

    RETURN total;
END$$

DELIMITER ;

-- SELECT total_reservas_por_sala(5);
