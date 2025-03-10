const connect = require("./connect");

module.exports = function testConnect() {
  try {
    const query = `SELECT 'Conexão bem-sucedida' AS Mensagem`;
    connect.query(query, function (err) {
      if (err) {
        console.log("Conexão não realizada", err);
        return;
      }
      console.log("Conexão realizada com o Mysql");
    });
  } catch(error){
    console.error('Erro ao executar a consulta', error)
  }
};
