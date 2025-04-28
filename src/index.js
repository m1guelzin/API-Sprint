//Importa o modulo Express
const express = require("express");
const cors = require("cors");
require ("dotenv-safe").config();
const jwt = require ("jsonwebtoken");
const testConnect = require('./db/testConnect');


//Define uma classe para organizar a logica da aplicação
class AppController {
  constructor() {
    //Cria uma nova instancia do Express dentro da classe
    this.express = express();
    //Chama o metodo middlewares para configurar os middlewares
    this.middlewares();
    //Chama o metodo routes para definir as rotas da Api
    this.routes();
    testConnect();
  }
  middlewares() {
    //Permitir que a aplicação receba dados em formato JSON nas requisições
    this.express.use(express.json());
    this.express.use(cors());
  }

  //Define as rotas da nossa API
  routes() {
    const apiRoutes = require('./routes/apiRoutes');
    this.express.use('/project-senai/api/v1', apiRoutes)

    //Define uma rota GET para o caminho health
    this.express.get("/health/", (req, res) => {
      res.send({status: "OK"});
    });//Essa rota é usada para verificar se a Api esta ok
  }
}

//Exportando a instancia de Express configurada, para que seja acessada em outros arquivos
module.exports = new AppController().express;