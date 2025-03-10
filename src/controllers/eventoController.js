const connect = require("../db/connect");

module.exports = class eventoController {
  //criação de um evento
  static async createEvento(req, res) {
    const { nome, descricao, data_hora, local, fk_id_organizador } = req.body;

    //Validação generica de todos atributos
    if (!nome || !descricao || !data_hora || !local || !fk_id_organizador) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }
    const query = `insert into evento 
    (nome, descricao, data_hora, local, fk_id_organizador) values(?,?,?,?,?)`;
    const values = [nome, descricao, data_hora, local, fk_id_organizador];
    try{
        connect.query(query, values, (err) =>{
            if(err){
                console.log(err);
                return res.status(500).json({error: "Erro ao criar o evento!"});
            }
            else{
                return res.status(201).json({message: "Evento criado com Sucesso!"})
            }
        })
    }catch(error){
        console.log("Erro ao executar consulta: ", error);
        return res.status(500).json({eror: "Erro interno do servidor!"});
    }
  }//Fim do create  

//Visualizar todos os eventos
static async getAllEventos(req, res){
    const query = `select * from evento`;

    try{
        connect.query(query, (err, results) =>{
            if(err) {
                console.log(err);
                return res.status(500).json({error: "Erro ao buscar Eventos"})
            }
        return res.status(200).json({message: "Eventos Listados com sucesso", events:results})
        });
    }catch(error){
        console.error("Erro ao executar a consulta", error)
        return res.status(500).json({error: "Erro interno do Servidor",})
    }
}//Fim do GetAllEventos

//Atualiza um evento
static async updateEvento(req, res) {
    const { id_evento, nome, descricao, data_hora, local, fk_id_organizador } = req.body;

    if (!id_evento || !nome || !descricao || !data_hora || !local || !fk_id_organizador) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    const query = `UPDATE evento SET nome=?, descricao=?, data_hora=?, local=?, fk_id_organizador=?  WHERE id_evento = ?`;
    const values = [nome, descricao, data_hora, local,fk_id_organizador, id_evento];

    try {
      connect.query(query, values, (err, results) => {
        console.log("Resultados: ", results)
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "Evento não encontrado" });
        }
        return res.status(200).json({ message: "Evento atualizado com sucesso" });
      });
    } catch (error) {
      console.error("Erro ao executar consulta:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }//Fim do Update

  // Deletar um evento
  static async deleteEvento(req, res) {
    const id_evento = req.params.id;

    const query = `DELETE FROM evento WHERE id_evento = ?`;
    const values = [id_evento];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao excluir Evento" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Evento não encontrado" });
        }
        return res.status(200).json({ message: "Evento excluído com sucesso" });
      });
    } catch (error) {
      console.error("Erro ao executar consulta:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }//Fim do deleteEvento

  static async getEventosPorData(req, res){
    const query = `SELECT * FROM evento`
    
    try{
      connect.query(query, (err, results) => {
        if(err){
          console.error(err)
          return res.status(500).json({error:"Erro ao buscar eventos"})
        }
        const dataEvento = new Date(results[0].data_hora)
        const dia = dataEvento.getDate()
        const mes = dataEvento.getMonth() + 1
        const ano = dataEvento.getFullYear()
        console.log(dia+'/'+mes+'/'+ano)

        const now = new Date()
        const eventosPassados = results.filter(evento => new Date(evento.data_hora)<now);
        const eventosFuturos = results.filter(evento => new Date(evento.data_hora)>=now);

        const diferencaMs = eventosFuturos[0].data_hora.getTime() - now.getTime();
        const dias = Math.floor(diferencaMs/(1000*60*60*24))
        const horas = Math.floor((diferencaMs%(1000*60*60*24))/(1000*60*60))
        const minutos = Math.floor((diferencaMs%(1000*60*60))/(1000*60))
        console.log(diferencaMs,'Falta: '+dias+' dias '+horas+' horas'+' e '+minutos+' minutos.')

        //Comparando datas
        const dataFiltro = new Date('2024-12-15').toISOString().split("T");
        const eventosDia = results.filter(evento => new Date(evento.data_hora).toISOString().split("T")[0] === dataFiltro[0]
        );

        console.log("Eventos : ", eventosDia);

        return res.status(200).json({message: 'Ok', eventosPassados, eventosFuturos})
      })
    }catch(error){
      console.error(error);
      return res.status(500).json({error: "Erro ao buscar eventos"})
    }
  }

  static async getEventosData7Dias(req, res) {
    const dataFiltro = new Date(req.params.data).toISOString().split("T");
    const dataLimite = new Date(req.params.data);  
    dataLimite.setDate(dataLimite.getDate() + 7);  
    console.log("Data Fornecida:", dataFiltro, "\n");
    console.log("Data Limite:", dataLimite, "\n");
    const query = `SELECT * FROM evento`;
    try {
      connect.query(query, (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Erro ao buscar eventos" });
        }

        const eventosSelecionados = results.filter((evento) =>
            new Date(evento.data_hora).toISOString().split("T")[0] >= dataFiltro[0] && 
            new Date(evento.data_hora).toISOString().split("T")[0] < dataLimite.toISOString().split("T")[0]
        );

        console.log(eventosSelecionados);

        return res
          .status(200)
          .json({ message: "Eventos: ", eventosSelecionados });
      });
    } catch (error) {
      console.log("Erro ao executar a querry: ", error);
      return res.status(500).json({ error: "Erro interno do Servidor" });
    }
  } 
};