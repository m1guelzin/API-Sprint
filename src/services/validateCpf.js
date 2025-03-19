const connect = require("../db/connect");

module.exports = async function validateCpf(cpf, userId = null) {
  return new Promise((resolve, reject) => {
    // Consulta para verificar se o CPF já está cadastrado
    const query = "SELECT id_usuario FROM usuario WHERE cpf = ?";
    const values = [cpf];

    connect.query(query, values, (err, results) => {
      if (err) {
        // Caso ocorra um erro na consulta
        reject("Erro ao verificar CPF");
      } else if (results.length > 0) {
        const cpfCadastrado = results[0].id_usuario;

        // Se um userId foi passado (indica atualização) e o CPF pertence a outro usuário, retorna erro
        if (userId && cpfCadastrado !== userId) {
          resolve({ error: "CPF já cadastrado por outro usuário" });
        } else if (!userId) {
          // Se não há userId (indica que é um novo cadastro), retorna erro de CPF já cadastrado
          resolve({ error: "CPF já cadastrado por outro usuário" });
        } else {
          resolve(null); // CPF válido
        }
      } else {
        resolve(null); // CPF não encontrado, é válido
      }
    });
  });
};
