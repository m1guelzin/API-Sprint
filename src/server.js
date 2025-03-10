//Importa a instância do Express configurada em index.js
const app = require("./index");
const cors = require('cors');

//Configuração do CORS com origens permitidas
const corsOptions = {
    origin: '*', //Substitua pela origem permitida
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', //Métodos HTTP permitidos
    credentials: true, //Permite o uso de cookies e credenciais
    optionSuccessStatus: 204, //Define o status de resposta para o método OPTIONS
};

//Configuração do CORS com origens permitidas
app.use(cors(corsOptions));

//Inicia o servidor na porta 5000, tornando a API acessível em http://localhost:5000
app.listen(5000);