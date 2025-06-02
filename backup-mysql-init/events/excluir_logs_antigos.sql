CREATE EVENT IF NOT EXISTS `excluir_logs_antigos`
ON SCHEDULE EVERY 1 MONTH -- O evento será executado a cada 1 mês (você pode ajustar)
STARTS CURRENT_TIMESTAMP -- O evento começa a partir de agora
ON COMPLETION PRESERVE -- O evento não será deletado após sua execução
ENABLE -- O evento estará ativo
DO
    DELETE FROM reservas_log
    WHERE data_evento <= NOW() - INTERVAL 1 YEAR;