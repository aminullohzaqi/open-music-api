/* eslint-disable semi */
/* eslint-disable indent */

const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
    constructor (service, storageService, validator) {
        this._service = service;
        this._storageService = storageService;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
        this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
    }

    async postAlbumHandler (request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { name, year } = request.payload;

            const Id = await this._service.addAlbum({ name, year });

            const response = h.response({
                status: 'success',
                data: {
                    albumId: Id
                }
            });

            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getAlbumByIdHandler (request, h) {
        try {
            const { id } = request.params;
            const album = await this._service.getAlbumById(id);

            const response = h.response({
                status: 'success',
                data: {
                    album
                }
            });

            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async putAlbumByIdHandler (request, h) {
        try {
            this._validator.validateAlbumPayload(request.payload);
            const { id } = request.params;
            await this._service.editAlbumById(id, request.payload);

            const response = h.response({
                status: 'success',
                message: 'Album berhasil diedit'
            });

            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async deleteAlbumByIdHandler (request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteAlbumById(id);

            const response = h.response({
                status: 'success',
                message: 'Album berhasil dihapus'
            });

            response.code(200);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }

    async postUploadCoverHandler (request, h) {
        try {
            const { cover } = request.payload
            const { id } = request.params
            this._validator.validateAlbumCover(cover.hapi.headers)

            const filename = await this._storageService.writeFile(cover, cover.hapi)
            const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`

            await this._service.postAlbumCoverById(id, fileLocation)

            const response = h.response({
                status: 'success',
                message: 'Sampul berhasil diunggah'
            })

            response.code(201)
            return response
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message
                });

                response.code(error.statusCode);
                return response;
            }

            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });

            response.code(500);
            console.error(error);
            return response;
        }
    }
};

module.exports = AlbumsHandler;
