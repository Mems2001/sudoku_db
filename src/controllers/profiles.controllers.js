const profilesServices = require('../services/profiles.services')

function patchGameSettings(req , res) {
    // console.log(req.body)
    profilesServices.updateGameSettingsByUserId(req.body, req.session.user.user_id)
        .then(data => {
            res.status(201).json(data)
        })
        .catch(error => {
            res.status(500).json({
                message: error.message,
                error
            })
        })
}

module.exports = {
    patchGameSettings
}