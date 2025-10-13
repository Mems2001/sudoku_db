const models = require('../../models')

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

module.exports = {
    updateGameSettingsByUserId
}