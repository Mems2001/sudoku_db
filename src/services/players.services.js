const models = require('../../models')
const uuid = require('uuid')

async function createPlayerByUserId (user_id, game_id, {is_connected}) {
    const transaction = await models.sequelize.transaction()

    try {
        const game = await models.Games.findOne({where: {id: game_id},
        include: [
            {
                model: models.Puzzles,
                as: 'Puzzle',
                attributes: ['grid' , 'number']
            }
        ]
        })

        const player = await models.Players.create({
            id: uuid.v4(),
            user_id,
            game_id,
            grid: game.Puzzle.grid,
            number: game.Puzzle.number,
            isConnected: is_connected
        } , {transaction})

        await transaction.commit()
        return player
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function findPlayerByUserId (user_id) {
    return await models.Players.findOne({
        where: {
            user_id
        }
    })
}

async function findPlayerByGameId (game_id , user_id) {
    // console.log('---> params in findPlayerByGameId:' , game_id , user_id)
    return await models.Players.findOne({
        where: {
            game_id,
            user_id
        },
        include: [
            {
                model: models.Games,
                as: 'Game',
                attributes: ['status' , 'time' , 'time'],
                include: [
                    {
                        model: models.Puzzles,
                        as: 'Puzzle',
                        attributes: ['grid' , 'number'],
                        include: [
                            {
                                model: models.Sudokus,
                                as: 'Sudoku',
                                attributes: ['grid' , 'number']
                            }
                        ]
                    }
                ]
            }
        ]
    })
}

async function findPlayersByGameId (game_id) {
    return await models.Players.findAll({
        where: {
            game_id
        },
        include: [
            {
                model: models.Users,
                as: 'User',
                attributes: ['username']
            }
        ]
    })
}

async function findConnectedPlayersByGameId (game_id) {
    return await models.Players.findAll({
        where: {
            game_id,
            isConnected: true
        },
        include: [
            {
                model: models.Users,
                as: 'User',
                attributes: ['username']
            }
        ]
    })
}

async function verifyUserInPlayerList (game_id , user_id) {
    const playersList = await models.Players.findAll({
        where: {
            game_id
        },
        include: [
            {
                model: models.Users,
                as: 'User',
                attributes: ['id']
            }
        ]
    })

    let control = false
    playersList.forEach(player => {
        if (player.user_id === user_id) control = true
    });

    return control
}

async function updatePlayerByGameId (game_id , user_id , {grid, status , errors, is_connected}) {
    const transaction = await models.sequelize.transaction()
    try {
        let player = await models.Players.findOne({where:{
            user_id,
            game_id
        }})
        // console.log(player , game_id , user_id)
        if (player) {
            let number = player.number
            if (grid) {
                number = ''
                for (let i=0 ; i < 9 ; i++) {
                    for (let j=0 ; j<9 ; j++) {
                        number += String(grid[i][j])
                    }
                }
            }
            await player.update({grid , number , status , errors, isConnected:is_connected} , {transaction})
        }

        await transaction.commit()
        return player
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function destroyPlayerByUserIdGameId (user_id , game_id) {
    const transaction = await models.sequelize.transaction()
    try {
        const player = await models.Players.findOne({where: {user_id , game_id}})
        if (player) await player.destroy({transaction})
        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

module.exports = {
    createPlayerByUserId,
    findPlayerByUserId,
    findPlayerByGameId,
    findPlayersByGameId,
    findConnectedPlayersByGameId,
    verifyUserInPlayerList,
    updatePlayerByGameId,
    destroyPlayerByUserIdGameId
}