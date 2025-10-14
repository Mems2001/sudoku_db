const gamesServices = require('../services/games.services')

function postGame ( req , res ) {
    const user_id = req.session.user.user_id
    console.log('---> user_id <---' , user_id)
    gamesServices.createGame(req.body , user_id)
        .then(data => {
            res.status(201).json(data)
        })
        .catch(err => {
            res.status(400).json({
                message: err.message,
                err
            })
        })
}

function getGameById (req , res) {
    gamesServices.findGameById(req.params.game_id)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                message: err.message,
                err
            })
        })
}

function getMySavedGames (req , res) {
    gamesServices.findSavedGames(req.session.user.user_id)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({message: err.message, err})
        })
}

function patchGameById ( req , res ) {
    gamesServices.updateGameById(req.params.game_id, req.body)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                message: err.message,
                err
            })
        })
}

function deleteGameByPlayerId (req, res) {
    gamesServices.destroyGameByPlayerId(req.params.player_id)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                message: err.message,
                err
            })
        })
}

module.exports = {
    postGame,
    getGameById,
    patchGameById,
    getMySavedGames,
    deleteGameByPlayerId
}