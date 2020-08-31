const Sauce = require("../models/sauce");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce.likes = 0;
  sauce.dislikes = 0;
  sauce.usersLiked = [];
  sauce.usersDisliked = [];

  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject })
    .then(() => res.status(200).json({ message: "Sauce modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(201).json({ message: "Sauce supprimée" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case 1:
          if (!sauce.usersLiked.includes(req.body.user)) {
            sauce.usersLiked.push(req.body.userId);
          }
          break;
        case 0:
          const indexLikes = sauce.usersLiked.indexOf(req.body.userId);
          const indexDislikes = sauce.usersDisliked.indexOf(req.body.userId);

          if (indexLikes > -1) {
            sauce.usersLiked.splice(indexLikes, 1);
          }

          if (indexDislikes > -1) {
            sauce.usersDisliked.splice(indexLikes, 1);
          }
          break;
        case -1:
          if (!sauce.usersDisliked.includes(req.body.user)) {
            sauce.usersDisliked.push(req.body.userId);
          }
          break;
      }

      sauce.likes = sauce.usersLiked.length;
      sauce.dislikes = sauce.usersDisliked.length;

      Sauce.updateOne({ _id: sauce._id }, sauce)
        .then(() => res.status(200).json({ message: "Like modifié" }))
        .catch((error) => res.status(400).json({ error }));
    })

    .catch((error) => res.status(400).json({ error }));
};
