const connect = require("../db/connect");
module.exports = class userController {
  static async createUser(req, res) {
    const { cpf, nome, telefone, email, senha } = req.body;

    if (!cpf || !nome || !telefone || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    } else if (isNaN(cpf) || cpf.length !== 11) {
      return res.status(400).json({
        error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
      });
    } else if (!email.includes("@")) {
      return res.status(400).json({ error: "Email inválido. Deve conter @" });
    } else {
      // Verificar se o CPF já está vinculado a outro usuário
      const queryCPF = `SELECT * FROM usuario WHERE cpf = '${cpf}'`;

      try {
        // Executando a query para verificar o CPF
        connect.query(queryCPF, function (err, results) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro interno do servidor" });
          }
          if (results.length > 0) {
            //Resposta para o usuario de cpf ja cadastrado
            return res
              .status(400)
              .json({ error: "O CPF já está vinculado a outro usuário" });
          } else {
            // Se o CPF não estiver vinculado, verifica o email
            const queryEmail = `SELECT * FROM usuario WHERE email = '${email}'`;

            connect.query(queryEmail, function (err, results) {
              if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erro interno do servidor" });
              }
              if (results.length > 0) {
                //Resposta para o usuario de email ja cadastrado
                return res
                  .status(400)
                  .json({ error: "O Email já está vinculado a outro usuário" });
              } else {
                // Se CPF e email não estão vinculados, insere o novo usuário
                const queryInsert = `INSERT INTO usuario (cpf, nome, telefone, email, senha) VALUES (
                  '${cpf}',
                  '${nome}',
                  '${telefone}',
                  '${email}',
                  '${senha}'
                )`;
                connect.query(queryInsert, function (err) {
                  if (err) {
                    console.error(err);
                    return res
                      .status(500)
                      .json({ error: "Erro ao cadastrar usuário" });
                  }
                  return res
                    .status(201)
                    .json({ message: "Usuário cadastrado com sucesso" });
                });
              }
            });
          }
        });
      }// Fechamento do Try
      catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }// Fechamento do catch
    }
  }

  //Inicio das condição de Login ---------------------------------------
  static async loginUser(req, res) {
    const { cpf, senha } = req.body;

    // Validações básicas
    if (!cpf || !senha) {
      return res.status(400).json({ error: "CPF e senha são obrigatórios" });
    } else if (isNaN(cpf) || cpf.length !== 11) {
      return res.status(400).json({
        error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
      });
    }

    // Query para verificar se o usuário existe com o CPF fornecido
    const queryLogin = `SELECT * FROM usuario WHERE cpf = '${cpf}'`;

    try {
      // Executando a query
      connect.query(queryLogin, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }
        if (results.length === 0) {
          // CPF não encontrado no banco de dados
          return res.status(404).json({ error: "Usuário não encontrado" });
        }

        const user = results[0];

        // Verificação da senha
        if (user.senha !== senha) {
          return res.status(401).json({ error: "Senha incorreta" });
        }

        // Se o CPF e a senha estiverem corretos, login bem-sucedido
        return res.status(200).json({
          message: "Login bem-sucedido",
          user: {
          id_usuario: user.id_usuario,
          cpf: user.cpf,
          nome: user.nome,
          },
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }


//Próximas funções
static async getAllUsers(req, res) {
  const query = `SELECT * FROM usuario`;
  try {
    connect.query(query, function (err, results) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno do Servidor" });
      }
      return res.status(200).json({ message: "Lista de Usuários", users: results });
    });
  } catch (error) {
    console.error("Erro ao executar consulta:", error);
    return res.status(500).json({ error: "Erro interno do Servidor" });
  }
}


static async updateUser(req, res) {
  const { id_usuario, nome, telefone, email, senha } = req.body;

  if (!id_usuario || !nome || !telefone || !email || !senha) {
    return res.status(400).json({ error: "Todos os campos devem ser preenchidos" });
  }

  const queryUpdate = `UPDATE usuario SET nome=?, telefone=?, email=?, senha=? WHERE id_usuario = ?`;
  const valuesUpdate = [nome, telefone, email, senha, id_usuario];

  try {
    connect.query(queryUpdate, valuesUpdate, (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ error: "Email já cadastrado por outro usuário" });
        }
        console.error(err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      return res.status(200).json({ message: "Usuário atualizado com sucesso" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

static async deleteUser(req, res) {
  const userId = req.params.id;
  const queryDelete = `DELETE FROM usuario WHERE id_usuario=?`;
  const values = [userId];

  try {
    connect.query(queryDelete, values, function (err, results) {
      if (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
          // Tratamento do erro de chave estrangeira
          console.error('Erro de integridade referencial:', err);
          return res.status(400).json({ error: "Impossível deletar conta. Reservas relacionadas." });
        }
        console.error('Erro ao deletar usuário:', err);
        return res.status(500).json({ error: "Erro interno no servidor" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      return res.status(200).json({ message: "Usuário excluído com sucesso" });
    });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}


static async getUserById(req, res) {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "ID do usuário é obrigatório" });
  }

  const query = `SELECT * FROM usuario WHERE id_usuario = ?`; // Ajuste o campo `id` conforme o banco

  connect.query(query, [userId], function (err, results) {
    if (err) {
      console.error("Erro ao buscar usuário:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Supondo que você tenha reservas relacionadas ao usuário
    const user = results[0];
    const queryReservas = `SELECT * FROM usuario WHERE id_usuario = ?`;

    connect.query(queryReservas, [userId], function (err, reservas) {
      if (err) {
        console.error("Erro ao buscar reservas:", err);
        return res.status(500).json({ error: "Erro interno ao buscar reservas" });
      }

      return res.status(200).json({
        user: {
          id: user.id_usuario,
          nome: user.nome,
          email: user.email,
          telefone: user.telefone,
          cpf: user.cpf
        },
      });
    });
  });
}


};


