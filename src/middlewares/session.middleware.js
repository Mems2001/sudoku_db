const { verify } = require('jsonwebtoken')

function authenticateSession ( req , res , next ) {
    try {
        const access_token = req.cookies['sudoku21-access-token']
        // console.log(access_token)
        const data = verify(access_token , process.env.JWT_SECRET)
        // console.log(data)
        if (data) {
            req.session.user = data
            // req.session.role = data.role
            return next()
        } else {
            req.session.user = null
            res.status(400).json({
                message: 'Unauthorized'
            })
        }
    } catch (error) {
        req.session.user = null
        res.status(401).json({
            message: 'Unauthorized'
        })
    }
}

module.exports = {
    authenticateSession
}