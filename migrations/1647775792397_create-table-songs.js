/* eslint-disable indent */
/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('songs', {
        id: {
            type: 'varchar(50)',
            notNull: true,
            primaryKey: true
        },
        title: {
            type: 'varchar(100)',
            notNull: true
        },
        year: {
            type: 'integer',
            notNull: true
        },
        genre: {
            type: 'varchar(100)',
            notNull: true
        },
        performer: {
            type: 'varchar(100)',
            notNull: true
        },
        duration: {
            type: 'integer',
            notNull: false
        },
        albumId: {
            type: 'varchar(100)',
            notNull: false
        }
    })
}

exports.down = pgm => {
    pgm.dropTable('songs')
}
