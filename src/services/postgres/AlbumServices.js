/* eslint-disable indent */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const NotFoundError = require('../../exceptions/NotFoundError')

class AlbumsService {
    constructor (cacheService) {
        this._pool = new Pool()
        this._cacheService = cacheService
    }

    async addAlbum ({ name, year }) {
        const id = `album-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, year]
        }

        const { rows } = await this._pool.query(query)

        if (!rows[0].id) {
            throw new Error('Album gagal ditambahkan')
        }
        return rows[0].id
    }

    async getAlbumById (id) {
        try {
            const result = await this._cacheService.get(`album-songs:${id}`)
            return {
                source: 'cache',
                albumSongs: JSON.parse(result)
            }
        } catch (error) {
            const queryAlbum = {
                text: 'SELECT * FROM albums WHERE id = $1',
                values: [id]
            }

            const querySongs = {
                text: 'SELECT songs.id, songs.title, songs.performer FROM albums INNER JOIN songs ON albums.id=songs.albumid WHERE albums.id=$1',
                values: [id]
            }

            const { rows: resultAlbum } = await this._pool.query(queryAlbum)
            const { rows: resultSongs } = await this._pool.query(querySongs)

            if (!resultAlbum.length) {
                throw new NotFoundError('Album tidak ditemukan')
            }

            const result = {
                id: resultAlbum[0].id,
                name: resultAlbum[0].name,
                year: resultAlbum[0].year,
                coverUrl: resultAlbum[0].cover,
                songs: resultSongs
            }

            await this._cacheService.set(`album-songs:${id}`, JSON.stringify(result))

            return {
                source: 'database',
                albumSongs: result
            }
        }
    }

    async editAlbumById (id, { name, year }) {
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        }

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new NotFoundError('Album gagal diedit. Id tidak ditemukan')
        }

        await this._cacheService.delete(`album-songs:${id}`)
    }

    async deleteAlbumById (id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id]
        }

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
        }

        await this._cacheService.delete(`album-songs:${id}`)
    }

    async postAlbumCoverById (id, cover) {
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2',
            values: [cover, id]
        }

        await this._pool.query(query)
        await this._cacheService.delete(`album-songs:${id}`)
    }

    async postUserAlbumLikeById (userId, albumId) {
        const queryAlbum = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [albumId]
        }

        const { rows: resultAlbum } = await this._pool.query(queryAlbum)

        if (!resultAlbum.length) {
            throw new NotFoundError('Album tidak ditemukan')
        }

        const querySearchLike = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId]
        }

        const { rows: resultSearchLike } = await this._pool.query(querySearchLike)

        if (!resultSearchLike.length) {
            const id = `like-${nanoid(16)}`

            const queryLike = {
                text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES ($1, $2, $3)',
                values: [id, userId, albumId]
            }

            await this._pool.query(queryLike)
            await this._cacheService.delete(`album-likes:${albumId}`)

            return 'Berhasil menyukai album'
        } else {
            const queryDeleteLike = {
                text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
                values: [userId, albumId]
            }

            await this._pool.query(queryDeleteLike)
            await this._cacheService.delete(`album-likes:${albumId}`)

            return 'Berhasil menghapus like album'
        }
    }

    async getUserAlbumLikesById (albumId) {
        try {
            const result = await this._cacheService.get(`album-likes:${albumId}`)
            return {
                source: 'cache',
                albumLikes: JSON.parse(result)
            }
        } catch (error) {
            const queryAlbum = {
                text: 'SELECT * FROM albums WHERE id = $1',
                values: [albumId]
            }

            const { rows: resultAlbum } = await this._pool.query(queryAlbum)

            if (!resultAlbum.length) {
                throw new NotFoundError('Album tidak ditemukan')
            }

            const queryLikes = {
                text: 'SELECT COUNT(user_id) FROM user_album_likes WHERE album_id = $1',
                values: [albumId]
            }

            const { rows: resultLikes } = await this._pool.query(queryLikes)
            const resultLikesNumber = Number(resultLikes[0].count)

            await this._cacheService.set(`album-likes:${albumId}`, JSON.stringify(resultLikesNumber))

            return {
                source: 'database',
                albumLikes: resultLikesNumber
            }
        }
    }
}

module.exports = AlbumsService
