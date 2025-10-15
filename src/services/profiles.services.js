const models = require('../../models')

function handleGameStatByGameType(game_type) {
    switch(game_type) {
        case 0:
            return "single_player"
        case 1:
            return "time_vs"
        case 2:
            return "cooperative"
    }
}

function handleGameStatByDifficulty(puzzle_difficulty, type) {
    switch (puzzle_difficulty) {
        case 0:
            return "novice_games_" + type
        case 1:
            return "easy_games_" + type
        case 2:
            return "normal_games_" + type
        case 3:
            return "hard_games_" + type
        case 4:
            return "expert_games_" + type
        case 5:
            return "master_games_" + type
    }
}

function handleErrorStatByDifficulty(puzzle_difficulty) {
    switch (puzzle_difficulty) {
        case 0:
            return "novice_errors"
        case 1:
            return "easy_errors"
        case 2:
            return "normal_errors"
        case 3:
            return "hard_errors"
        case 4:
            return "expert_errors"
        case 5:
            return "master_errors"
    }
}

async function findProfilesByGameId(game_id) {
    const players = await models.Players.findAll({
        where: {
            game_id
        }
    })
    let profiles = []
    for (const player of players) {
        const profile = await models.Profiles.findOne({
            where: {
                user_id: player.user_id
            }
        })
        profiles.push(profile)
    }
    // console.log(profiles)

    return profiles
}

async function updateGameSettingsByUserId({cellsHighlight, numbersHighlight, highlightColor, inputMode}, user_id) {
    const transaction = await models.sequelize.transaction()

    try {
        const gameSettings = await models.Profiles.findOne({
            where:{
                user_id
            }
        })
        await gameSettings.update({
            cells_highlight: cellsHighlight,
            numbers_highlight: numbersHighlight,
            highlight_color: highlightColor,
            input_mode: inputMode
        }, {transaction})

        await transaction.commit()

        return gameSettings
    } catch (error) {
        await transaction.rollback()
        console.error(error)
        throw error
    }
}

async function updateProfileErrorsByUserId (user_id, errors, game_type, puzzle_difficulty) {
    const transaction = await models.sequelize.transaction()

    try {
        const profile = await models.Profiles.findOne({
            where: {
                user_id
            }
        })
        const game_type_name = handleGameStatByGameType(game_type)
        const puzzle_difficulty_errors = handleErrorStatByDifficulty(puzzle_difficulty)

        const game_stats = profile.game_stats
        const game_type_stats = game_stats[game_type_name]
        let new_game_type_stats = {
            ...game_type_stats,
            [puzzle_difficulty_errors]: game_type_stats[puzzle_difficulty_errors] ? game_type_stats[puzzle_difficulty_errors] + errors : errors
        }

        let new_game_stats = {
            ...game_stats,
            [game_type_name]: new_game_type_stats
        }

        await profile.update({game_stats: new_game_stats}, {transaction})

        await transaction.commit()
    } catch (error) {
        await transaction.rollback()
        console.error(error)
        throw error
    }
}

async function updateProfileWin(user_id, game_type, puzzle_difficulty) {
    const transaction = await models.sequelize.transaction()

    try {
        const profile = await models.Profiles.findOne({
            where: {
                user_id
            }
        })
        const game_type_name = handleGameStatByGameType(game_type)
        const puzzles_won_by_difficulty = handleGameStatByDifficulty(puzzle_difficulty, 'won')

        const game_stats = profile.game_stats
        const game_type_stats = game_stats[game_type_name]
        let new_game_type_stats = {
            ...game_type_stats,
            [puzzles_won_by_difficulty]: game_type_stats[puzzles_won_by_difficulty] ? game_type_stats[puzzles_won_by_difficulty] + 1 : 1
        }

        let new_game_stats = {
            ...game_stats,
            [game_type_name]: new_game_type_stats
        }

        await profile.update({game_stats: new_game_stats}, {transaction})

        await transaction.commit()
    } catch(error) {
        await transaction.rollback()
        console.error(error)
        throw error
    }
}

async function updateProfileLose(user_id, game_type, puzzle_difficulty) {
    const transaction = await models.sequelize.transaction()

    try {
        const profile = await models.Profiles.findOne({
            where: {
                user_id
            }
        })
        const game_type_name = handleGameStatByGameType(game_type)
        const puzzles_won_by_difficulty = handleGameStatByDifficulty(puzzle_difficulty, 'lost')

        const game_stats = profile.game_stats
        const game_type_stats = game_stats[game_type_name]
        let new_game_type_stats = {
            ...game_type_stats,
            [puzzles_won_by_difficulty]: game_type_stats[puzzles_won_by_difficulty] ? game_type_stats[puzzles_won_by_difficulty] + 1 : 1
        }

        let new_game_stats = {
            ...game_stats,
            [game_type_name]: new_game_type_stats
        }

        await profile.update({game_stats: new_game_stats}, {transaction})

        await transaction.commit()
    } catch(error) {
        await transaction.rollback()
        console.error(error)
        throw error
    }
}

module.exports = {
    updateProfileWin,
    updateProfileLose,
    findProfilesByGameId,
    handleGameStatByGameType,
    updateGameSettingsByUserId,
    handleGameStatByDifficulty,
    handleErrorStatByDifficulty,
    updateProfileErrorsByUserId
}