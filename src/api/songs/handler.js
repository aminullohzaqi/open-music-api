/* eslint-disable indent */

const ClientError = require('../../exceptions/ClientError')

class SongsHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        this.postSongHandler = this.postSongHandler.bind(this)
        this.getSongsHandler = this.getSongsHandler.bind(this)
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this)
        this.putSongByIdHandler = this.putSongByIdHandler.bind(this)
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this)
    }

    async postSongHandler (request, h) {
        try {
            this._validator.validateSongPayload(request.payload)

            const Id = await this._service.addSong(request.payload)

            const response = h.response({
                status: 'success',
                data: {
                    songId: Id
                }
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

    async getSongsHandler (request, h) {
        try {
            const { title, performer } = request.query
            const songs = await this._service.getSongs(title, performer)

            return {
                status: 'success',
                data: {
                    songs: songs
                }
            }
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

    async getSongByIdHandler (request, h) {
        try {
            const { id } = request.params
            const songData = await this._service.getSongById(id)

            return {
                status: 'success',
                data: {
                    song: {
                        id: songData.id,
                        title: songData.title,
                        year: songData.year,
                        performer: songData.performer,
                        genre: songData.genre,
                        duration: songData.duration,
                        albumId: songData.albumid
                    }
                }
            }
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

    async putSongByIdHandler (request, h) {
        try {
            this._validator.validateSongPayload(request.payload)
            const { id } = request.params

            await this._service.editSongById(id, request.payload)

            return {
                status: 'success',
                message: 'Berhasil mengubah lagu.'
            }
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

    async deleteSongByIdHandler (request, h) {
        try {
            const { id } = request.params

            await this._service.deleteSongById(id)

            return {
                status: 'success',
                message: 'Berhasil menghapus lagu.'
            }
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
};

module.exports = SongsHandler
