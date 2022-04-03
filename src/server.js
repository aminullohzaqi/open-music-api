/* eslint-disable indent */
require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

// Albums
const albums = require('./api/albums')
const AlbumsService = require('./services/postgres/AlbumServices')
const AlbumsValidator = require('./validator/albums')

// Songs
const songs = require('./api/songs')
const SongsService = require('./services/postgres/SongServices')
const SongsValidator = require('./validator/songs')

// Users
const users = require('./api/users')
const UsersService = require('./services/postgres/UserServices')
const UsersValidator = require('./validator/users')

// Authentication
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationServices')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

// Playlist
const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistServices')
const PlaylistsValidator = require('./validator/playlists')

// Collaboration
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationServices')
const CollaborationsValidator = require('./validator/collaborations')

// Export
const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

// Storage
const StorageService = require('./services/storage/StorageService')

// Cache
const CacheService = require('./services/redis/CacheService')

const init = async () => {
    const cacheService = new CacheService()
    const collaborationsService = new CollaborationsService(cacheService)
    const playlistsService = new PlaylistsService(collaborationsService, cacheService)
    const albumsService = new AlbumsService(cacheService)
    const songsService = new SongsService(cacheService)
    const usersService = new UsersService()
    const authenticationsService = new AuthenticationsService()
    const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/covers'))

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    // registrasi plugin eksternal
    await server.register([
        {
            plugin: Jwt
        },
        {
            plugin: Inert
        }
    ])

    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('openmusicapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id
            }
        })
    })

    // registrasi plugin internal
    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                storageService: storageService,
                validator: AlbumsValidator
            }
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator
            }
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator
            }

        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator
            }
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator
            }
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator
            }
        },
        {
            plugin: _exports,
            options: {
                producerService: ProducerService,
                playlistsService: playlistsService,
                validator: ExportsValidator
            }
        }
    ])

    await server.start()
    console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
