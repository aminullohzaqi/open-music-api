/* eslint-disable indent */
const ClientError = require('../../exceptions/ClientError')

class PlaylistsHandler {
    constructor (service, validator) {
        this._service = service
        this._validator = validator

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this)
        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this)
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this)
        this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this)
        this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this)
    }

    async postPlaylistHandler (request, h) {
        try {
            this._validator.validatePlaylistPayload(request.payload)

            const { name } = request.payload
            const { id: credentialId } = request.auth.credentials

            const Id = await this._service.addPlaylist({ name, owner: credentialId })

            const response = h.response({
                status: 'success',
                data: {
                    playlistId: Id
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

    async getPlaylistsHandler (request, h) {
        try {
            const { id: credentialId } = request.auth.credentials
            const playlists = await this._service.getPlaylists(credentialId)

            return {
                status: 'success',
                data: {
                    playlists: playlists
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

    async deletePlaylistByIdHandler (request, h) {
        try {
            const { id } = request.params
            const { id: credentialId } = request.auth.credentials

            await this._service.verifyPlaylistOwner(id, credentialId)
            await this._service.deletePlaylistById(id)

            return {
                status: 'success',
                message: 'Berhasil menghapus playlist.'
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

    async postSongToPlaylistHandler (request, h) {
        try {
            this._validator.validatePlaylistSongPayload(request.payload)
            const { id } = request.params
            const { songId } = request.payload
            const { id: credentialId } = request.auth.credentials

            await this._service.verifyPlaylistAccess(id, credentialId)
            await this._service.addSongToPlaylist(id, songId)
            await this._service.addActivity(id, songId, credentialId)

            const response = h.response({
                status: 'success',
                message: 'Berhasil menambahkan lagu ke playlist.'
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

    async getSongsFromPlaylistHandler (request, h) {
        try {
            const { id } = request.params
            const { id: credentialId } = request.auth.credentials

            await this._service.verifyPlaylistAccess(id, credentialId)
            const songs = await this._service.getSongsFromPlaylist(id)

            return {
                status: 'success',
                data: {
                    playlist: songs
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

    async deleteSongFromPlaylistHandler (request, h) {
        try {
            this._validator.validatePlaylistSongPayload(request.payload)

            const { id } = request.params
            const { songId } = request.payload
            const { id: credentialId } = request.auth.credentials

            await this._service.verifyPlaylistAccess(id, credentialId)
            await this._service.deleteSongFromPlaylist(id, songId)
            await this._service.deleteActivity(id, songId, credentialId)

            return {
                status: 'success',
                message: 'Berhasil menghapus lagu dari playlist.'
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

    async getPlaylistActivitiesHandler (request, h) {
        try {
            const { id } = request.params
            const { id: credentialId } = request.auth.credentials

            await this._service.verifyPlaylistAccess(id, credentialId)
            const activities = await this._service.getPlaylistActivities(id)

            return {
                status: 'success',
                data: activities
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
}

module.exports = PlaylistsHandler
