/* eslint-disable indent */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
    constructor (collaborationService) {
        this._pool = new Pool()
        this._collaborationService = collaborationService
    }

    async addPlaylist ({ name, owner }) {
        const id = 'playlist-' + nanoid(16)

        const query = {
            text: 'INSERT INTO playlist (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, owner]
        }

        const result = await this._pool.query(query)

        if (!result.rows[0].id) {
            throw new Error('Playlist gagal ditambahkan')
        }
        return result.rows[0].id
    }

    async getPlaylists (owner) {
        const query = {
            text: 'SELECT playlist.id, playlist.name, users.username AS username FROM playlist LEFT JOIN collaborations ON collaborations.playlist_id = playlist.id LEFT JOIN users ON users.id = playlist.owner WHERE playlist.owner = $1 OR collaborations.user_id = $1 GROUP BY (playlist.id, users.username)',
            values: [owner]
        }

        const result = await this._pool.query(query)

        return result.rows
    }

    async deletePlaylistById (id) {
        const queryPlaylist = {
            text: 'SELECT * FROM playlist WHERE id = $1',
            values: [id]
        }

        const resultPlaylist = await this._pool.query(queryPlaylist)

        if (!resultPlaylist.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const query = {
            text: 'DELETE FROM playlist WHERE id = $1',
            values: [id]
        }

        await this._pool.query(query)
    }

    async addSongToPlaylist (playlistId, songId) {
        const querySong = {
            text: 'SELECT title FROM songs WHERE id = $1',
            values: [songId]
        }

        const resultSong = await this._pool.query(querySong)

        if (!resultSong.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan')
        }

        const id = 'playlist_song-' + nanoid(16)

        const query = {
            text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3)',
            values: [id, playlistId, songId]
        }

        await this._pool.query(query)
    }

    async getSongsFromPlaylist (playlistId) {
        const queryPlaylist = {
            text: 'SELECT playlist.id, playlist.name, users.username FROM playlist_songs INNER JOIN playlist ON playlist_songs.playlist_id = playlist.id INNER JOIN users ON playlist.owner = users.id WHERE playlist_id = $1 LIMIT 1',
            values: [playlistId]
        }

        const queryUser = {
            text: 'SELECT username FROM playlist INNER JOIN users ON playlist.owner = users.id WHERE playlist.id = $1 LIMIT 1',
            values: [playlistId]
        }

        const querySongs = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs INNER JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_id = $1',
            values: [playlistId]
        }

        const resultPlaylist = await this._pool.query(queryPlaylist)
        const resultUser = await this._pool.query(queryUser)
        const resultSongs = await this._pool.query(querySongs)

        if (!resultPlaylist.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        return {
            id: resultPlaylist.rows[0].id,
            name: resultPlaylist.rows[0].name,
            username: resultUser.rows[0].username,
            songs: resultSongs.rows
        }
    }

    async deleteSongFromPlaylist (playlistId, songId) {
        const query = {
            text: 'SELECT song_id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId]
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan di dalam playlist')
        }

        const queryDelete = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId]
        }

        await this._pool.query(queryDelete)
    }

    async addActivity (playlistId, songId, userId) {
        const querySong = {
            text: 'SELECT title FROM songs WHERE id = $1',
            values: [songId]
        }

        const resultSong = await this._pool.query(querySong)
        const songTitle = resultSong.rows[0].title

        const queryUser = {
            text: 'SELECT username FROM users WHERE id = $1',
            values: [userId]
        }

        const resultUser = await this._pool.query(queryUser)
        const username = resultUser.rows[0].username

        const idActivities = 'activity-' + nanoid(16)
        const timeActivity = new Date().toISOString()

        const queryActivities = {
            text: 'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time) VALUES ($1, $2, $3, $4, $5, $6)',
            values: [idActivities, playlistId, songTitle, username, 'add', timeActivity]
        }

        await this._pool.query(queryActivities)
    }

    async deleteActivity (playlistId, songId, userId) {
        const querySong = {
            text: 'SELECT title FROM songs WHERE id = $1',
            values: [songId]
        }

        const resultSong = await this._pool.query(querySong)
        const songTitle = resultSong.rows[0].title

        const queryUser = {
            text: 'SELECT username FROM users WHERE id = $1',
            values: [userId]
        }

        const resultUser = await this._pool.query(queryUser)
        const username = resultUser.rows[0].username

        const idActivities = 'activity-' + nanoid(16)
        const timeActivity = new Date().toISOString()

        const queryActivities = {
            text: 'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time) VALUES ($1, $2, $3, $4, $5, $6)',
            values: [idActivities, playlistId, songTitle, username, 'delete', timeActivity]
        }

        await this._pool.query(queryActivities)
    }

    async getPlaylistActivities (playlistId) {
        const query = {
            text: 'SELECT * FROM playlist_song_activities WHERE playlist_id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('Tidak ada aktivitas')
        }

        const resultMap = result.rows.map(row => {
            return {
                username: row.user_id,
                title: row.song_id,
                action: row.action,
                time: row.time
            }
        })

        return {
            playlistId: playlistId,
            activities: resultMap
        }
    }

    async verifyPlaylistOwner (id, owner) {
        const query = {
            text: 'SELECT * FROM playlist WHERE id = $1',
            values: [id]
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const playlist = result.rows[0]

        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
        }
    }

    async verifyPlaylistAccess (playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId)
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }

            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId)
            } catch (error) {
                throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
            }
        }
    }
}

module.exports = PlaylistsService
