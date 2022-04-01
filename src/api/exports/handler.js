/* eslint-disable indent */
const ClientError = require('../../exceptions/ClientError')

class ExportsHandler {
    constructor (producerService, playlistsService, validator) {
        this._producerService = producerService
        this._playlistsService = playlistsService
        this._validator = validator

        this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this)
    }

    async postExportPlaylistsHandler (request, h) {
        try {
            this._validator.validateExportPlaylistsPayload(request.payload)

            const { playlistId } = request.params
            const userId = request.auth.credentials.id

            await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

            const { targetEmail } = request.payload

            const message = {
                playlistId: playlistId,
                targetEmail: targetEmail
            }

            await this._producerService.sendMessage('export:playlist', JSON.stringify(message))

            const response = h.response({
                status: 'success',
                message: 'Permintaan Anda sedang kami proses'
            })

            response.code(201)
            return response
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                })

                response.code(error.statusCode)
                return response
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            })

            response.code(500)
            console.error(error)
            return response
        }
    }
}

module.exports = ExportsHandler
