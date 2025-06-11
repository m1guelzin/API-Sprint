DELIMITER //
CREATE TRIGGER trg_before_delete_usuario
BEFORE DELETE ON usuario
FOR EACH ROW
BEGIN
    INSERT INTO usuarios_log (
        id_usuario_afetado,
        cpf,
        nome,
        email,
        senha, -- Adicionando a senha (hash)
        tipo_evento
    )
    VALUES (
        OLD.id_usuario,
        OLD.cpf,
        OLD.nome,
        OLD.email,
        OLD.senha, -- Capturando a hash da senha do registro que está sendo excluído
        'EXCLUSAO'
    );
END //
DELIMITER ;