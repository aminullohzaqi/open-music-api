/* eslint-disable indent */
/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
    pgm.sql('ALTER TABLE albums ADD COLUMN cover varchar(100)')
}

exports.down = pgm => {
    pgm.dropColumns('albums', 'cover')
}
