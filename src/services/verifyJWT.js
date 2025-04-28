const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET 

function verifyJWT(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }
    
    // Aqui preenche o req.user
    req.userId = {
      id: decoded.id, // Pega o id que você salvou quando criou o token
    };

    next(); // deixa seguir para o controller
  });
}

module.exports = verifyJWT;
