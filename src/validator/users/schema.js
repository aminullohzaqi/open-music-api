/* eslint-disable indent */
const Joi = require('joi')

const UserPayloadShema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    fullname: Joi.string().required()
})

module.exports = { UserPayloadShema }
