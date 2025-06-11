CREATE EVENT IF NOT EXISTS `excluir_reservas_antigas`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE
ENABLE -- O evento estará ativo
DO
    DELETE FROM reservas
    WHERE CONCAT(data_reserva, ' ', horario_fim) <= NOW();
    -- (2025-04-3 11:00:00)
