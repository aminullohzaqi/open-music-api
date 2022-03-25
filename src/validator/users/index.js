/* eslint-disable indent */
const InvariantError = require('../../exceptions/InvariantError')
const { UserPayloadShema } = require('./schema')

const UsersValidator = {
    validateUserPayload: (payload) => {
        const validationResult = UserPayloadShema.validate(payload)

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
}

module.exports = UsersValidator
