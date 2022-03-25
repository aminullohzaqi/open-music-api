/* eslint-disable semi */
/* eslint-disable indent */
require('dotenv').config();

const Hapi = require('@hapi/hapi');

// Albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumServices');
const AlbumsValidator = require('./validator/albums');

// Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongServices');
const SongsValidator = require('./validator/songs');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UserServices');
const UsersValidator = require('./validator/users');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
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

        }
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init()
