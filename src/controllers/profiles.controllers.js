const profilesServices = require('../services/profiles.services')

function getMyProfile(req, res) {
    profilesServices.findProfileByUserId(req.session.user.user_id)
        .then(data => {
            if (data) res.status(200).json(data)
            else res.status(404).json({message: 'Profile not found'})
        })
        .catch(error => {
            res.status(500).json({
                message: error.message,
                error
            })
        })
}

function patchGameSettings(req , res) {
    // console.log('📝 Controller: patchGameSettings called')
    // console.log('📝 Controller: req.session.user =', req.session.user)
    // console.log('📝 Controller: user_id being passed =', req.session.user.user_id)
    // console.log('📝 Controller: req.body =', req.body)
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
    getMyProfile,
    patchGameSettings
}