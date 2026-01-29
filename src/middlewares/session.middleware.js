const { verify } = require('jsonwebtoken')

/**
 * In order to authenticate a session this middleware will check for an access token. Since anon users do have a user id and profile they alsa have an access token. However, the middleware allows us to identify them. Anon users can save games or game settings, but they cannot access to overall game data of profile settings.
 * @returns 
 */
function authenticateSession ( req , res , next ) {
    try {
        const access_token = req.cookies['sudoku21-access-token']
        console.log('🔐 Middleware: access_token exists?', !!access_token)
        const data = verify(access_token , process.env.JWT_SECRET)
        // console.log('🔐 Middleware: token verified, data =', data)
        if (data) {
            req.session.user = data
            console.log('✅ Middleware: Calling next()')
            return next()
        } else {
            console.log('❌ Middleware: data is falsy, NOT calling next()')
            req.session.user = null
            res.status(400).json({
                message: 'Unauthorized'
            })
        }
    } catch (error) {
        console.log('❌ Middleware: Token verification failed:', error.message)
        req.session.user = null
        res.status(401).json({
            message: 'Unauthorized'
        })
    }
}

module.exports = {
    authenticateSession
}