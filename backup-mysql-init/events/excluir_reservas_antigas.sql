CREATE EVENT IF NOT EXISTS `excluir_reservas_antigas`
ON SCHEDULE EVERY 1 DAY -- O evento será executado a cada 1 dia
STARTS CURRENT_TIMESTAMP -- O evento começa a partir de agora
ON COMPLETION PRESERVE -- O evento não será deletado após sua execução
ENABLE -- O evento estará ativo
DO
    DELETE FROM reservas
    WHERE CONCAT(data_reserva, ' ', horario_fim) <= NOW();
    -- (2025-04-3 11:00:00)
