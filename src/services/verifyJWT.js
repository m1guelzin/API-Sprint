const jwt = require ("jsonwebtoken");

function verifyJWT(req, res, next){
    const token = req.headers["authorization"]

    if(!token){
        return res.status(401).json({auth:false, message:"Token não foi fornecido"})
    }

    jwt.verify(token, process.env.SECRET, (err, decoded)=>{
        if(err){
            return res.status(403).json({auth:false, message:"Falha na Autenticação do Token"})
        }
        req.userId = decoded.id;
        next();
    })  
}

module.exports = verifyJWT;