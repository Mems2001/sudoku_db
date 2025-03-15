//Para gestionar la conexión con la base de datos
const {Sequelize} = require("sequelize")

let db = undefined

if (process.env.NODE_ENV === 'development') {
    db = new Sequelize({
        dialect : "postgres",
        host : process.env.DB_HOST_LOCAL ,
        database: process.env.DB_NAME_LOCAL ,
        username : process.env.DB_USER_LOCAL ,
        password : process.env.DB_PASS_LOCAL ,
        port : process.env.DB_PORT    
    })

} else if (process.env.NODE_ENV === 'production') {
    db = new Sequelize({
        dialect : "postgres",
        host : process.env.DB_HOST ,
        database: process.env.DB_NAME ,
        username : process.env.DB_USER ,
        password : process.env.DB_PASS ,
        port : process.env.DB_PORT    
    })
}

module.exports = db