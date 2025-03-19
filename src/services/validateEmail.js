const connect = require("../db/connect");

module.exports = function validateEmail(email, userId = null) {
  return new Promise((resolve, reject) => {
    const query = "SELECT id_usuario FROM usuario WHERE email = ?";
    const values = [email];

    connect.query(query, values, (err, results) => {
      if (err) {
        return reject("Erro ao verificar Email");
      }

      if (results.length > 0) {
        const emailCadastrado = results[0].id_usuario;

        // Se um userId foi passado (update) e o Email pertence a outro usuário, retorna erro
        if (userId && emailCadastrado !== userId) {
          return resolve({ error: "Email já cadastrado por outro usuário" });
        } else if (!userId) {
          return resolve({ error: "Email já cadastrado por outro usuário" });
        }
      }

      resolve(null);
    });
  });
};
