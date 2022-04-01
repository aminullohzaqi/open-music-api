/* eslint-disable indent */
/* eslint-disable semi */
const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, CoversSchema } = require('./schema');

const AlbumsValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateAlbumCover: (headers) => {
        const validationResult = CoversSchema.validate(headers);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
};

module.exports = AlbumsValidator;
