const connect = require("../db/connect");
module.exports = class orgController {
  static async createOrganizador(req, res) {
    const { telefone, email, senha, nome } = req.body;

    if (!telefone || !email || !senha || !nome) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    } else if (isNaN(telefone) || telefone.length !== 11) {
      return res
        .status(400)
        .json({
          error:
            "Telefone inválido. Deve conter exatamente 11 dígitos numéricos",
        });
    } else if (!email.includes("@")) {
      return res.status(400).json({ error: "Email inválido. Deve conter @" });
    } else {
      // Construção da query INSERT
      const query = `INSERT INTO organizador (telefone, senha, email, nome) VALUES(
      '${telefone}',
      '${senha}',
      '${email}',
      '${nome}')`;
      // Executando a query criada
      try {
        connect.query(query, function (err) {
          if (err) {
            console.log(err);
            console.log(err.code);
            if (err.code === "ER_DUP_ENTRY") {
              return res
                .status(400)
                .json({
                  error: "O Email ja está vinculado a outro organizador",
                });
            } else {
              return res
                .status(500)
                .json({ error: "Erro interno do servidor" });
            }
          } else {
            return res
              .status(201)
              .json({ message: "Organizador cadastrado com sucesso" });
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  }

  static async getAllOrganizadores(req, res) {
    const query = `SELECT * FROM organizador`;
    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return req.status(500).json({ error: "Erro interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Lista de Organizadores", orgs: results });
      });
    } catch (error) {
      console.error("Erro ao executar consulta:", error);
      return res.status(500).json({ error: "Erro interno do Servidor" });
    }
  }

  static async updateOrganizador(req, res) {
    // Desestrutura e recupera os dados enviados via corpo da requisição
    const { id, telefone, email, senha, nome } = req.body;

    // Validar se todos os campos foram preenchidos
    if (!id || !telefone || !email || !senha || !nome) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }
    const query = `UPDATE organizador SET nome=?, email=?, senha=?, telefone=? WHERE id_organizador = ?`;
    const values = [nome, email, senha, telefone, id];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "Email já cadastrado por outro organizador" });
          } else {
            console.error(err);
            res.status(500).json({ error: "Erro interno do Servidor" });
          }
        }
        if(results.affectedRows === 0){
          return res.status(404).json({error:"Organizador não encontrado"});
        }
        return res.status(200).json({message:"Organizador atualizado com sucesso"});
      });
    } catch (error) {
      console.error("Erro ao executar consulta", error);
      return res.status(500).json({error: "Erro interno do servidor"});
    }
  }

  static async deleteOrganizador(req, res) {
    const orgId = req.params.id;
    const query = `DELETE FROM organizador WHERE id_organizador=?`;
    const values = [orgId];

    try{
      connect.query(query,values,function(err,results){
        if(err){
          console.error(err);
          return res.status(500).json({error: "Erro interno no servidor"});
        }
        if(results.affectedRows === 0){
          return res.status(404).json({error: "Organizador não encontrado"});
        }
        return res.status(200).json({message:"Organizador excluido com sucesso"});
      });
    }catch(error){
      console.error(err);
      return res.status(500).json({error: "Erro interno do servidor"});
    }
  }
};
