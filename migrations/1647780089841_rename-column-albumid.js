/* eslint-disable indent */
/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.renameColumn('songs', 'albumId', 'albumid')
}

exports.down = pgm => {
    pgm.renameColumn('songs', 'albumid', 'albumId')
}
