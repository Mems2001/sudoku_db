const PlayersService = require('../services/players.services')

function postPlayerByUserId (req , res) {
    PlayersService.createPlayerByUserId(req.session.user.user_id , req.params.game_id)
        .then(data => {
            res.status(201).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

function getPlayersByGameId (req, res) {
    PlayersService.findPlayersByGameId(req.params.game_id)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

function getPlayerIsInList (req , res) {
    PlayersService.verifyUserInPlayerList(req.params.game_id , req.session.user.user_id)
        .then(data => {
            if (data) res.status(200).json(data)
            else res.status(404).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

module.exports = {
    postPlayerByUserId,
    getPlayersByGameId,
    getPlayerIsInList
}