/* eslint-disable indent */
/* eslint-disable semi */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor () {
        this._pool = new Pool();
    }

    async addAlbum ({ name, year }) {
        const id = 'album-' + nanoid(16);

        const query = {
            text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, year]
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new Error('Album gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getAlbumById (id) {
        const queryAlbum = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id]
        };

        const querySongs = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM albums INNER JOIN songs ON albums.id=songs.albumid WHERE albums.id=$1',
            values: [id]
        }

        const resultAlbum = await this._pool.query(queryAlbum);
        const resultSongs = await this._pool.query(querySongs);

        if (!resultAlbum.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return {
            id: resultAlbum.rows[0].id,
            name: resultAlbum.rows[0].name,
            year: resultAlbum.rows[0].year,
            songs: resultSongs.rows
        }
    }

    async editAlbumById (id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal diedit. Id tidak ditemukan');
        }
    }

    async deleteAlbumById (id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = AlbumsService;
