/* eslint-disable indent */
/* eslint-disable semi */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.renameColumn('songs', 'albumId', 'albumid');
};

exports.down = pgm => {
    pgm.renameColumn('songs', 'albumid', 'albumId');
};
