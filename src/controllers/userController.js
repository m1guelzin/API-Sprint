const connect = require("../db/connect");
const validateUser = require("../services/validateUser");
const validateCpf = require("../services/validateCpf");
const validateEmail = require("../services/validateEmail");
const jwt = require("jsonwebtoken");

module.exports = class userController {
  static async createUser(req, res) {
    const { cpf, nome, telefone, email, senha } = req.body;

    // Valida os campos básicos
    const validationError = validateUser({ cpf, email, senha, nome, telefone });
    if (validationError) {
      return res.status(400).json(validationError);
    }

    try {
      // Verifica se CPF já existe
      const cpfError = await validateCpf(cpf);
      if (cpfError) return res.status(400).json(cpfError);

      // Verifica se Email já existe
      const emailError = await validateEmail(email);
      if (emailError) return res.status(400).json(emailError);

      // Insere o usuário no banco de dados
      const queryInsert = `INSERT INTO usuario (cpf, nome, telefone, email, senha) VALUES (?, ?, ?, ?, ?)`;
      const values = [cpf, nome, telefone, email, senha];

      connect.query(queryInsert, values, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao cadastrar usuário" });
        }
        return res.status(201).json({ message: "Usuário cadastrado com sucesso" });
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
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
        const token = jwt.sign({id: user.id_usuario}, process.env.SECRET, {expiresIn:"1h"});

        //Remove um atributo de um objeto
        delete user.password;

        return res.status(200).json({message:"Login bem sucedido",
          user,
          token
        })
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
  const { id_usuario, nome, telefone, email, senha, cpf } = req.body;
  const userId = id_usuario;
  const VerificarToken = userId;

  // Aqui você precisa ter certeza que `req.user.id` existe, ou adaptar conforme seu token
  if (VerificarToken !== req.userId.id) {
    return res.status(403).json({ error: "Usuário não autorizado a atualizar este perfil" });
  }

  // Verificar se todos os campos necessários foram preenchidos
  if (!id_usuario || !nome || !telefone || !email || !senha || !cpf) {
    return res.status(400).json({ error: "Todos os campos devem ser preenchidos" });
  }

  try {
    // Validar se CPF já está cadastrado para outro usuário
    const cpfError = await validateCpf(cpf, id_usuario);
    if (cpfError) return res.status(400).json(cpfError);

    // Validar se Email já está cadastrado para outro usuário
    const emailError = await validateEmail(email, id_usuario);
    if (emailError) return res.status(400).json(emailError);

    // Atualizar os dados no banco
    const queryUpdate = `UPDATE usuario SET nome=?, telefone=?, email=?, senha=?, cpf=? WHERE id_usuario = ?`;
    const valuesUpdate = [nome, telefone, email, senha, cpf, id_usuario];

    connect.query(queryUpdate, valuesUpdate, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao atualizar usuário" });
      }
      return res.status(200).json({ message: "Usuário atualizado com sucesso" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}



static async deleteUser(req, res) {
  const userId = req.params.id; // ID que veio da URL
  const usuarioId = req.userId.id; // ID do usuário autenticado (via token)

  // Verifica se o usuário autenticado está tentando deletar outro usuário
  if (Number(userId) !== Number(usuarioId)) {
    return res.status(403).json({ error: "Usuário não autorizado a deletar este perfil" });
  }
  
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
  const userId = req.params.id_usuario; // ID que veio da URL

  if (!userId) {
    return res.status(400).json({ error: "ID do usuário é obrigatório" });
  }

  const query = `SELECT * FROM usuario WHERE id_usuario = ?`;

  connect.query(query, [userId], function (err, results) {
    if (err) {
      console.error("Erro ao buscar usuário:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Pega o primeiro usuário encontrado
    const user = results[0];

    return res.status(200).json({
      user: {
        id: user.id_usuario,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cpf: user.cpf,
      },
    });
  });
}

};


