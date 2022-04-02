/* eslint-disable indent */
/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('playlist_song_activities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true
        },
        song_id: {
            type: 'VARCHAR(50)',
            notNull: true
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true
        },
        action: {
            type: 'VARCHAR(20)',
            notNull: true
        },
        time: {
            type: 'VARCHAR(50)',
            notNull: true
        }
    })

    pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlist.id', 'FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE')
}

exports.down = pgm => {
    pgm.dropConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlist.id')

    pgm.dropTable('playlist_song_activities')
}
