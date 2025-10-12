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

async function getPlayerByGameId (req , res) {
    // console.log("---> user data in getPlayerByGameId:" , req.session)
    await PlayersService.findPlayerByGameIdUserId(req.params.game_id , req.session.user.user_id)
        .then(data => {
            // console.log("data from getPlayerByGameId:" , data)
            if (data) res.status(200).json(data)
            else res.status(404).json({message:'player not found'})
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

function getConnectedPlayersByGameId (req, res) {
    PlayersService.findConnectedPlayersByGameId(req.params.game_id)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({
                error: err.message
            })
        })
}

function getPlayerIsOnList (req , res) {
    console.log('Is this user in list?' , req.session.user)
    PlayersService.verifyUserOnPlayerList(req.params.game_id , req.session.user.user_id)
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

function patchPlayerByGameId (req, res) {
    // console.log(req.params)
    PlayersService.updatePlayerByGameId(req.params.game_id , req.session.user.user_id, req.body)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => {
            res.status(400).json({error: err.message})
        })
}

module.exports = {
    postPlayerByUserId,
    getPlayerByGameId,
    getPlayersByGameId,
    getConnectedPlayersByGameId,
    getPlayerIsOnList,
    patchPlayerByGameId
}