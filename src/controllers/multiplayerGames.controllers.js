const MultiplayerGamesServices = require('../services/multiplayerGames.services')

function postMultiplayerGame (req, res) {
    console.log(req.session)
    MultiplayerGamesServices.createMultiplayerGame(req.body , req.session.user.user_id)
        .then(data => {
            res.status(201).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

function getMultiplayerGameById (req, res) {
    MultiplayerGamesServices.findMultiplayerGameById(req.params.game_id)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

module.exports = {
    postMultiplayerGame,
    getMultiplayerGameById
}