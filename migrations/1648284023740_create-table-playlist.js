/* eslint-disable indent */
/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('playlist', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        name: {
            type: 'TEXT',
            notNull: true
        },
        owner: {
            type: 'TEXT',
            notNull: true
        }
    })
}

exports.down = pgm => {
    pgm.dropTable('playlist')
}
