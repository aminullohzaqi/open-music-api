/* eslint-disable indent */
/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
    pgm.addConstraint('songs', 'fk_songs.albumid_albums.id', 'FOREIGN KEY (albumid) REFERENCES albums(id) ON DELETE CASCADE')

    pgm.addConstraint('playlist', 'fk_playlist.owner_users.id', 'FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE')

    pgm.addConstraint('playlist_songs', 'fk_playlist.playlist_id_playlist.id', 'FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE')

    pgm.addConstraint('playlist_songs', 'fk_playlist.song_id_songs.id', 'FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE')
}

exports.down = pgm => {
    pgm.dropConstraint('songs', 'fk_songs.albumid_albums.id')

    pgm.dropConstraint('playlist', 'fk_playlist.owner_users.id')

    pgm.dropConstraint('playlist_songs', 'fk_playlist.playlist_id_playlist.id')

    pgm.dropConstraint('playlist_songs', 'fk_playlist.song_id_songs.id')
}
