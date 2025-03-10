// Importa o módulo Router do express
// Router será  utiliziado para definir rotas específicas da aplicação
const router = require('express').Router();

// Importa a controller onde contém a lógica relacionada a professores
const userController = require("../controllers/userController");
const reservaController = require("../controllers/reservaController");
const salasController = require("../controllers/salasController");

// Rotas Para userController
router.post('/user', userController.createUser);
router.post('/login', userController.loginUser);
// Rotas alternativas da CONTROLLER DE USUARIOS
router.delete('/user/:id', userController.deleteUser);
router.get('/user', userController.getAllUsers);
router.put('/user', userController.updateUser);
router.get('/user/:id', userController.getUserById);

// Rotas Para reservaController
router.post("/reservas", reservaController.createReserva);
router.get("/reservas", reservaController.getReservas); 
router.get("/reservas/user/:id_usuario", reservaController.getReservasByUser); // Obter reservas de um usuário específico
router.put("/reservas", reservaController.updateReserva);
router.delete("/reservas/:id_reserva", reservaController.deleteReserva); 

// Rotas Para salasController
router.post("/salas", salasController.createSala);
router.get("/salas", salasController.getAllSalas);
router.put("/salas", salasController.updateSala);
router.delete("/salas/:id", salasController.deleteSala);

module.exports = router