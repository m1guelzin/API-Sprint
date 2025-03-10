const connect = require("../db/connect");
module.exports = class userController {
  static async createUser(req, res) {
    const { cpf, email, password, name, data_nascimento } = req.body;

    if (!cpf || !email || !password || !name || !data_nascimento) {
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
      // Construção da query INSERT
      const query = `INSERT INTO usuario (cpf, password, email, name, data_nascimento) VALUES(
    '${cpf}',
    '${password}',
    '${email}',
    '${name}',
    '${data_nascimento}')`;
      // Executando a query criada
      try {
        connect.query(query, function (err) {
          if (err) {
            console.log(err);
            console.log(err.code);
            if (err.code === "ER_DUP_ENTRY") {
              return res
                .status(400)
                .json({ error: "O Email ou Cpf ja está vinculado a outro usuário" });
            } else {
              return res
                .status(500)
                .json({ error: "Erro interno do servidor" });
            }
          } else {
            return res
              .status(201)
              .json({ message: "Usuário cadastrado com sucesso" });
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  }

  static async getAllUsers(req, res) {
    const query = `SELECT * FROM usuario`;
    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Lista de Usuários", users: results });
      });
    } 
    catch (error) {
      console.error("Erro ao executar consulta:", error)
      return res.status(500).json({error: "Erro interno do Servidor"})
    }
  }

  static async updateUser(req, res) {
    // Desestrutura e recupera os dados enviados via corpo da requisição
    const { id, cpf, email, password, name } = req.body;

    // Validar se todos os campos foram preenchidos
    if (!id || !cpf || !email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }
    const query = `UPDATE usuario SET cpf=?, email=?, password=?, name=? WHERE id_usuario = ?`;
    const values = [cpf, email, password, name, id];

    try{
      connect.query(query, values, function(err, results){
        if(err){
          if (err.code === "ER_DUP_ENTRY"){
            return res.status(400).json({error: "Email já cadastrado por outro usuário"});
          } else{
            console.error(err);
            res.status(500).json({error: "Erro interno do Servidor"})
          }
        }
        if(results.affectedRows === 0){
          return res.status(404).json({message: "Usuário não encontrado"});
        }
        return res.status(200).json({message: "Usuário atualizado com sucesso"});
      });
    }catch(error){
      console.error("Erro ao executar consulta", error);
      return res.status(500).json({error: "Erro interno do Servidor"});
    }
  }

  static async deleteUser(req, res) {
    // Obtem o parametro 'id' da requisição, que é o cpf do user a ser deletado
    const userId = req.params.id;
    const query = `DELETE FROM usuario WHERE id_usuario=?`;
    const values = [userId];

    try{
      connect.query(query,values,function(err,results){
        if(err){
          console.error(err);
          return res.status(500).json({error: "Erro interno no servidor"});
        }
        if(results.affectedRows === 0){
          return res.status(404).json({error: "Usuário não encontrado"});
        }
        return res.status(200).json({message:"Usuário excluido com sucesso"});
      });
    }catch(error){
      console.error(err);
      return res.status(500).json({error: "Erro interno do servidor"});
    }
  }

  static async loginUser(req, res){
    const {email, password} = req.body

    if(!email || !password){
      return res.status(400).json({error:"Email e senha são obrigatórios"})
    }

    const query = `SELECT * FROM usuario WHERE email = ?`

    try {
      connect.query(query,[email],(err, results) =>{
        if(err){
          console.log(err)
          return res.status(500).json({error:"Erro interno do servidor"})
        }
        if(results.length === 0){
          return res.status(401).json({message:"Usuário não encontrado"})
        }
        const user = results[0];

        if(user.password !== password){
          return res.status(403).json({error:"Senha incorreta"})
        }

        return res.status(200).json({message:"Login bem sucedido", user})
      })
    } catch (error) {
      console.log(err)
      return res.status(500).json({error: "Erro interno do servidor"})
    }

  }
};
