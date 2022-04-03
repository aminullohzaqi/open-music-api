/* eslint-disable indent */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
    constructor (collaborationService, cacheService) {
        this._pool = new Pool()
        this._collaborationService = collaborationService
        this._cacheService = cacheService
    }

    async addPlaylist ({ name, owner }) {
        const id = `playlist-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO playlist (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
            values: [id, name, owner]
        }

        const { rows } = await this._pool.query(query)

        if (!rows[0].id) {
            throw new Error('Playlist gagal ditambahkan')
        }

        await this._cacheService.delete(`playlists:${owner}`)

        return rows[0].id
    }

    async getPlaylists (owner) {
        try {
            const result = await this._cacheService.get(`playlists:${owner}`)
            return {
                source: 'cache',
                playlist: JSON.parse(result)
            }
        } catch (error) {
            const query = {
                text: 'SELECT playlist.id, playlist.name, users.username AS username FROM playlist LEFT JOIN collaborations ON collaborations.playlist_id = playlist.id LEFT JOIN users ON users.id = playlist.owner WHERE playlist.owner = $1 OR collaborations.user_id = $1 GROUP BY (playlist.id, users.username)',
                values: [owner]
            }

            const { rows } = await this._pool.query(query)

            await this._cacheService.set(`playlists:${owner}`, JSON.stringify(rows))

            return {
                source: 'database',
                playlist: rows
            }
        }
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
            text: 'DELETE FROM playlist WHERE id = $1 RETURNING id, owner',
            values: [id]
        }

        const { rows } = await this._pool.query(query)

        const { owner } = rows[0]
        await this._cacheService.delete(`playlists:${owner}`)
    }

    async addSongToPlaylist (playlistId, songId) {
        const querySong = {
            text: 'SELECT title FROM songs WHERE id = $1',
            values: [songId]
        }

        const { rows } = await this._pool.query(querySong)

        if (!rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan')
        }

        const id = `playlist_song-${nanoid(16)}`

        const query = {
            text: 'INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES ($1, $2, $3)',
            values: [id, playlistId, songId]
        }

        await this._pool.query(query)
        await this._cacheService.delete(`playlist-songs:${playlistId}`)
    }

    async getSongsFromPlaylist (playlistId) {
        try {
            const result = await this._cacheService.get(`playlist-songs:${playlistId}`)
            return {
                source: 'cache',
                playlistSongs: JSON.parse(result)
            }
        } catch (error) {
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

            const { rows: resultPlaylist } = await this._pool.query(queryPlaylist)
            const { rows: resultUser } = await this._pool.query(queryUser)
            const { rows: resultSongs } = await this._pool.query(querySongs)

            if (!resultPlaylist.length) {
                throw new NotFoundError('Playlist tidak ditemukan')
            }

            const result = {
                id: resultPlaylist[0].id,
                name: resultPlaylist[0].name,
                username: resultUser[0].username,
                songs: resultSongs
            }

            await this._cacheService.set(`playlist-songs:${playlistId}`, JSON.stringify(result))

            return {
                source: 'database',
                playlistSongs: result
            }
        }
    }

    async deleteSongFromPlaylist (playlistId, songId) {
        const query = {
            text: 'SELECT song_id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId]
        }

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan di dalam playlist')
        }

        const queryDelete = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
            values: [playlistId, songId]
        }

        await this._pool.query(queryDelete)
        await this._cacheService.delete(`playlist-songs:${playlistId}`)
    }

    async addActivity (playlistId, songId, userId) {
        const querySong = {
            text: 'SELECT title FROM songs WHERE id = $1',
            values: [songId]
        }

        const { rows: resultSong } = await this._pool.query(querySong)
        const songTitle = resultSong[0].title

        const queryUser = {
            text: 'SELECT username FROM users WHERE id = $1',
            values: [userId]
        }

        const { rows: resultUser } = await this._pool.query(queryUser)
        const username = resultUser[0].username

        const idActivities = `activity-${nanoid(16)}`
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

        const { rows: resultSong } = await this._pool.query(querySong)
        const songTitle = resultSong[0].title

        const queryUser = {
            text: 'SELECT username FROM users WHERE id = $1',
            values: [userId]
        }

        const { rows: resultUser } = await this._pool.query(queryUser)
        const username = resultUser[0].username

        const idActivities = `activity-${nanoid(16)}`
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

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new NotFoundError('Tidak ada aktivitas')
        }

        const resultMap = rows.map(row => {
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
            text: 'SELECT owner FROM playlist WHERE id = $1',
            values: [id]
        }

        const { rows } = await this._pool.query(query)

        if (!rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const playlist = rows[0]

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
