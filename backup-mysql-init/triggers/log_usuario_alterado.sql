DELIMITER //
CREATE TRIGGER trg_after_update_usuario
AFTER UPDATE ON usuario
FOR EACH ROW
BEGIN
    -- Só insere no log se houver alguma mudança nos campos relevantes, incluindo a senha
    IF OLD.cpf <> NEW.cpf OR
       OLD.nome <> NEW.nome OR
       OLD.telefone <> NEW.telefone OR
       OLD.email <> NEW.email OR
       OLD.senha <> NEW.senha THEN -- Se a senha (hash) for alterada
        INSERT INTO usuarios_log (
            id_usuario_afetado,
            cpf,
            nome,
            email,
            senha, -- Adicionando a senha (hash)
            tipo_evento
        )
        VALUES (
            NEW.id_usuario,
            NEW.cpf,
            NEW.nome,
            NEW.email,
            NEW.senha, -- Capturando a hash da senha após a atualização
            'ATUALIZACAO'
        );
    END IF;
END //
DELIMITER ;