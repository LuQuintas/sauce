const Sauce = require('../models/sauce');
const fs = require('fs'); //file système afin de modifier ou supprimer des fichiers du système 


///////////
// CREATION DE SAUCE
//////////

exports.createSauce = (req, res, next)=>{
    const sauceObject = JSON.parse (req.body.sauce); //récupérer l'objet json
    delete sauceObject._id; // suppression de l'id du coté front
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // on génère l'url des images de façons dynamique
    });
    sauce.save()
        .then(()=> res.status(201).json({message:'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({error}));
};

//////////////
// MODIFICTION DE SAUCE
/////////////

exports.modifySauce = (req, res, next)=>{
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
            const sauceObject = req.file ?

            {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            } : {...req.body};

            const filename = sauce.imageUrl.split('/images/')[1]; // on extrait le nom du fichier à supprimer
            fs.unlink(`images/${filename}`, ()=> { // suppression du fichier du dossier images
                Sauce.updateOne({_id: req.params.id}, {... sauceObject, _id: req.params.id})
                    .then(()=> res.status(200).json({message: 'Sauce modifiée !'}))
                    .catch(error=> res.status(404).json({error}));
            });
    })
    .catch(error => res.status(400).json({message:'Error error'}));
};

///////////
// SUPPRESSION DE SAUCE
///////////

exports.deleteSauce = (req,res, next)=>{
    Sauce.findOne({ _id: req.params.id })
    .then(sauce=>{
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, ()=> {
            Sauce.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({message:'Sauce supprimée !'}))
                .catch(error=> res.status(400).json({error}));
            });
    })
    .catch(error => res.status(500).json({message :"Error delete"}));
};

////////////
// RECUPERER UNE SAUCE PAR SON ID
///////////

exports.getOneSauce = (req, res, next)=>{
    Sauce.findOne({_id: req.params.id})
        .then(sauce=> res.status(200).json(sauce))
        .catch(error=> res.status(404).json({error}));
};

///////////
// RECUPERER TOUTES LES SAUCES
//////////

exports.getAllSauce = (req, res, next)=>{
    Sauce.find()
        .then(sauces=> res.status(200).json(sauces))
        .catch(error=> res.status(400).json({error}));
};


////////
// LIKE OU DISLIKE SAUCE
///////

exports.likeSauce = (req, res, next) =>{
    const Like = req.body.like;
    const userId = req.body.userId;

    Sauce.findOne({_id: req.params.id})
    .then((sauce)=>{

        if(Like === 1){
            Sauce.updateOne({_id: req.params.id},{$inc: {likes:+1}, $push:{usersLiked: userId}})
            .then(()=>res.status(200).json({message:"L'utilisateur a liké"}))
            .catch(error=> res.status(400).json({message:"Erreur lors du like"}));
        }
        else if(Like === -1){
            Sauce.updateOne({_id: req.params.id},{$inc: {dislikes:+1}, $push:{usersDisliked: userId}})
            .then(()=>res.status(200).json({message:"L'utilisateur a disliké"}))
            .catch(error=> res.status(400).json({message:"Erreur lors du dislike"}));
        }
        else if(Like === 0){
            if(sauce.usersLiked.includes(userId)){
                Sauce.updateOne({_id: req.params.id},{$inc:{likes:-1}, $pull:{usersLiked:userId}})
                .then(()=>res.status(200).json({message:"L'utilisateur à retiré son like"}))
                .catch(error=>res.status(400).json({message:"Erreur pour retirer son like"}));
            }
            else if(sauce.usersDisliked.includes(userId)){
                Sauce.updateOne({_id:req.params.id},{$inc:{dislikes:-1}, $pull:{usersDisliked:userId}})
                .then(()=>res.status(200).json({message:"L'utilisateur à retiré son dislike"}))
                .catch(error=> res.status(400).json({message:"Erreur pour retirer son dislike"}));
            }
        }
    })
    .catch(error=>res.status(400).json({Error}));
};
