/* eslint-disable semi */
/* eslint-disable indent */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsServices {
    constructor () {
        this._pool = new Pool();
    }

    async addSong ({ title, year, genre, performer, duration, albumId }) {
        const id = 'song-' + nanoid(16);

        const query = {
            text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId]
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new Error('Lagu gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getSongs (title, performer) {
        title = title ? ('%' + title.toLowerCase() + '%') : undefined;
        performer = performer ? ('%' + performer.toLowerCase() + '%') : undefined;

        let query = {
            text: 'SELECT id, title, performer FROM songs'
        };

        if (title && performer) {
            query = {
                text: 'SELECT id, title, performer FROM songs WHERE LOWER( title ) LIKE $1 AND LOWER( performer ) LIKE $2',
                values: [title, performer]
            };
        } else if (title) {
            query = {
                text: 'SELECT id, title, performer FROM songs WHERE LOWER( title ) LIKE $1',
                values: [title]
            };
        } else if (performer) {
            query = {
                text: 'SELECT id, title, performer FROM songs WHERE LOWER( performer ) LIKE $1',
                values: [performer]
            };
        }
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return result.rows;
    }

    async getSongById (id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        return result.rows[0];
    }

    async editSongById (id, { title, year, genre, performer, duration, albumId }) {
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumid = $6 WHERE id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal diedit. Id tidak ditemukan');
        }
    }

    async deleteSongById (id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
};

module.exports = SongsServices;