CREATE TABLE reservas_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    fkid_usuario INT NOT NULL,        -- FK para o usuário que fez a reserva (dono da reserva)
    fkid_salas INT NOT NULL,
    data_reserva DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    data_exclusao DATETIME DEFAULT CURRENT_TIMESTAMP,
    excluido_por_usuario_id INT       -- Quem deletou (nesta opção, será o dono da reserva)
);

DELIMITER //
CREATE TRIGGER log_reserva_deletada
AFTER DELETE ON reservas
FOR EACH ROW
BEGIN
    INSERT INTO reservas_log (
        id_reserva,
        fkid_usuario,
        fkid_salas,
        data_reserva,
        horario_inicio,
        horario_fim,
        excluido_por_usuario_id -- Aqui a alteração: usa OLD.fkid_usuario
    )
    VALUES (
        OLD.id_reserva,
        OLD.fkid_usuario,
        OLD.fkid_salas,
        OLD.data_reserva,
        OLD.horario_inicio,
        OLD.horario_fim,
        OLD.fkid_usuario
    );
END; //

DELIMITER ;

static async deleteReserva(req, res) {
    const { id_reserva } = req.params;
    // userAuthId é capturado pelo token, mas não será usado para validação de dono
    // ou para preencher o log pela API, já que a trigger faz isso.
    const userAuthId = req.userId.id; 

    if (!id_reserva) {
        return res.status(400).json({ error: "ID da reserva é obrigatório." });
    }

    try {
        // 1. Verificar se a reserva existe
        // Fazemos um SELECT para dar um retorno 404 claro se a reserva não existir
        const [reserva] = await new Promise((resolve, reject) => {
            connect.query(`SELECT id_reserva FROM reservas WHERE id_reserva = ?`, [id_reserva], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (reserva.length === 0) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        // 2. Excluir a reserva. A trigger 'log_reserva_deletada' será acionada automaticamente.
        const queryDelete = `DELETE FROM reservas WHERE id_reserva = ?`;
        const valuesDelete = [id_reserva];

        const [deleteResults] = await new Promise((resolve, reject) => {
            connect.query(queryDelete, valuesDelete, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (deleteResults.affectedRows === 0) {
            // Caso raro, se a reserva foi deletada por outra requisição exatamente entre o SELECT e o DELETE
            return res.status(404).json({ message: "Reserva não encontrada ou já foi deletada." });
        }

        // Se chegou aqui, a reserva foi deletada com sucesso e a trigger cuidou do log
        return res.status(200).json({ message: "Reserva excluída com sucesso. Detalhes logados." });

    } catch (error) {
        console.error("Erro interno ao deletar reserva:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
}


