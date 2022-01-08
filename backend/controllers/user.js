const user = require ('../models/user');
const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');

///////
//CREATION DE COMPTE AVEC SIGNUP
//////

exports.signup = (req, res, next) => {
    const regex = /^(?=.*\d)(?=.*[a-zA-Z]).{6,20}$/;
    const password =req.body.password;

    if(password.match(regex)){
        bcrypt.hash(password, 10)
            .then(hash => {
                const User = new user({
                    email: req.body.email,
                    password: hash
                });
                User.save()
                .then (()=> res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(500).json({error}));
            })
            .catch(error => res.status(500).json({error}));
    }else{
        res.status(401).json({message:"Mot de passe non sécurisé. (6 caractères min dont un chiffre, une lettre et caractère spécial facultatif)"})
    }
};

////////
// CONNEXION DE COMPTE
///////

exports.login = (req, res, next) => {
    user.findOne({email: req.body.email })
    .then(user =>{
        if (!user){
            return res.status(401).json({error: 'Utilisateur non trouvé'});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid=> {
            if(!valid){
                return res.status(401).json({error: 'Mot de passe incorrect'})
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id },'RANDOM_TOKEN_SECRET',{expiresIn: '24h'})
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error =>res.status(500).json({error}));
};

 