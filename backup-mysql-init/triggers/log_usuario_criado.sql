DELIMITER //
CREATE TRIGGER trg_after_insert_usuario
AFTER INSERT ON usuario
FOR EACH ROW
BEGIN
    INSERT INTO usuarios_log (
        id_usuario_afetado,
        cpf,
        nome,
        email,
        senha,
        tipo_evento
    )
    VALUES (
        NEW.id_usuario,
        NEW.cpf,
        NEW.nome,
        NEW.email,
        NEW.senha,
        'CRIACAO'
    );
END //
DELIMITER ;