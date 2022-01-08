const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1];   // on récupère le token
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');  // on décode le token 
        const userId = decodedToken.userId; // on récupère l'id du token décodé


        if (req.body.userId && req.body.userId !== userId) {    // si l'userid est différent de celui du token
            throw 'User ID non valable !';
        } else {
            next();
        }
    } catch {
        res.status(401).json({message :'Requête invalide !'})
    };
};