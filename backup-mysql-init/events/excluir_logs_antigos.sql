CREATE EVENT IF NOT EXISTS `excluir_logs_antigos`
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_TIMESTAMP
ON COMPLETION PRESERVE -- O evento não será deletado
ENABLE -- O evento estará ativo
DO
    DELETE FROM reservas_log
    WHERE data_evento <= NOW() - INTERVAL 1 YEAR;


show events;