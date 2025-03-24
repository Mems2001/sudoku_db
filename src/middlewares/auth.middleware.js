const UsersController = require("../controllers/users.controller");
const usersController = new UsersController();
const {jwtSecret} = require('../../config/config').api;
require("dotenv").config();

//Passport maneja estrategias para diferentes tipos de autenticación
const JwtStrategy = require('passport-jwt').Strategy
//Extrae los headers de la petición
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport')

//Exportando función anónima
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: jwtSecret
}

passport.use(
    new JwtStrategy(options, async(decoded,done) => {
        // done(error,decoded)
        console.log({
            message: 'auth process on',
            location: 'auth middleware'
        })
        // console.log(decoded)
        try {
            const response = await usersController.findUserById(decoded.uid)
            // console.log({
            //     location: "auth middleware",
            //     response
            // })
            if (response) {
                return done(null , decoded) //No hay error pero si existe el usuario
            }
            console.log("decoded JWT" , decoded) //Mostramos la información del usuario logueado en la consola
            return done(null , false) //No hay error ni existe el usuario
        } catch (error) {
            console.log(error)
            return done(error , false); //Hay un error y no existe el usuario
        }
    })
)

module.exports = passport