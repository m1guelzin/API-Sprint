// Importa o módulo Router do express
// Router será  utiliziado para definir rotas específicas da aplicação
const router = require('express').Router();
const verifyJWT = require('../services/verifyJWT');
// Importa a controller onde contém a lógica relacionada a professores
const userController = require("../controllers/userController");
const reservaController = require("../controllers/reservaController");
const salasController = require("../controllers/salasController");

// Rotas Para userController
router.post('/user', userController.createUser);
router.post('/login', userController.loginUser);
// Rotas alternativas da CONTROLLER DE USUARIOS
router.delete('/user/:id', verifyJWT, userController.deleteUser);
router.get('/user', userController.getAllUsers);
router.put('/user', verifyJWT, userController.updateUser);
router.get('/user/:id_usuario',verifyJWT, userController.getUserById);

// Rotas Para reservaController
router.post("/reservas",verifyJWT, reservaController. createReserva);
router.get("/reservas", reservaController.getReservas); 
router.get("/reservas/user/:id_usuario",verifyJWT,reservaController.getReservasByUser);
router.delete("/reservas/:id_reserva",verifyJWT, reservaController.deleteReserva); 

// Rotas Para salasController
router.post("/salas", salasController.createSala);
router.get("/salas/horarios-disponiveis/:data",verifyJWT, salasController.getSalasHorariosDisponiveis);
router.get("/salas/disponiveis/:data",verifyJWT, salasController.getSalasDisponiveisPorData);
router.get("/salas",verifyJWT, salasController.getAllSalas);
router.put("/salas", salasController.updateSala);
router.delete("/salas/:id", salasController.deleteSala);

module.exports = router