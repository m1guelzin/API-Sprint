CREATE TABLE reservas_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    fkid_usuario_reserva INT NOT NULL, -- O usuário que FEZ a reserva (e também quem a criou/deletou)
    fkid_salas INT NOT NULL,
    data_reserva DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    data_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_evento ENUM('CRIACAO', 'EXCLUSAO') NOT NULL -- Indica se foi CRIAÇÃO ou EXCLUSAO
);