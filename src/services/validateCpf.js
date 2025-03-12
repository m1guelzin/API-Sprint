const connect = require("../db/connect");

module.exports = async function validateEmail(email, userId = null) {
    return new Promise((resolve, reject) => {
      const query = "SELECT id_usuario FROM usuario WHERE email = ?";
      const values = [email];
  
      connect.query(query, values, (err, results) => {
        if (err) {
          reject("Erro ao verificar Email");
        } else if (results.length > 0) {
          const emailCadastrado = results[0].id_usuario;
  
          // Permite atualização se o email pertencer ao mesmo usuário
          if (userId && emailCadastrado == userId) {
            resolve(null);
          } else {
            resolve({ error: "Email já cadastrado para outro usuário" });
          }
        } else {
          resolve(null);
        }
      });
    });
  };
  