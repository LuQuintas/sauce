const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next)=>{
    const sauceObject = JSON.parse (req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(()=> res.status(201).json({message:'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next)=>{
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
            const sauceObject = req.file ?

            {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            } : {...req.body};

            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, ()=> {
                Sauce.updateOne({_id: req.params.id}, {... sauceObject, _id: req.params.id})
                    .then(()=> res.status(200).json({message: 'Sauce modifiée !'}))
                    .catch(error=> res.status(404).json({error}));
            });
    })
    .catch(error => res.status(400).json({message:'error error'}));
};

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
    .catch(error => res.status(500).json({message :"error delete"}));
};

exports.getOneSauce = (req, res, next)=>{
    Sauce.findOne({_id: req.params.id})
        .then(sauce=> res.status(200).json(sauce))
        .catch(error=> res.status(404).json({error}));
};

exports.getAllSauce = (req, res, next)=>{
    Sauce.find()
        .then(sauces=> res.status(200).json(sauces))
        .catch(error=> res.status(400).json({error}));
};

exports.likeSauce = (req, res, next) =>{
    const like = req.body.like;
    const userId = req.body.userId;

    if (like == 1){               
        Sauce.updateOne({_id : req.params.id},
        {$inc: {likes:1}, $push:{usersliked: userId}, _id:req.params.id})
        .then(()=> res.status(200).json({message:"L'utilisateur a liké"}))
        .catch(error => res.status(400).json({error})); 
    }
}
