/* eslint-disable indent */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class CollaborationsService {
    constructor (cacheService) {
        this._pool = new Pool()
        this._cacheService = cacheService
    }

    async addCollaboration (playlistId, userId) {
        const queryUser = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [userId]
        }

        const { rows: resultUser } = await this._pool.query(queryUser)

        if (!resultUser.length) {
            throw new NotFoundError('User tidak ditemukan')
        }

        const id = `collab-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING id',
            values: [id, playlistId, userId]
        }

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new InvariantError('Kolaborasi gagal ditambahkan')
        }

        await this._cacheService.delete(`playlists:${userId}`)
        return rows[0].id
    }

    async deleteCollaboration (playlistId, userId) {
        const query = {
            text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
            values: [playlistId, userId]
        }

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new InvariantError('Kolaborasi gagal dihapus')
        }

        await this._cacheService.delete(`playlists:${userId}`)
    }

    async verifyCollaborator (playlistId, userId) {
        const query = {
            text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
            values: [playlistId, userId]
        }

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new InvariantError('Kolaborasi gagal diverifikasi')
        }
    }
}

module.exports = CollaborationsService
