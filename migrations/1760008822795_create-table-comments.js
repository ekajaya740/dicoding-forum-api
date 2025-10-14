/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    threadId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    isDeleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false,
    },
  }, {
    foreignKeys: [
      {
        columns: 'owner',
        references: {
          schema: 'public',
          name: 'users',
        },
        onDelete: 'CASCADE',
      },
      {
        columns: 'threadId',
        references: {
          schema: 'public',
          name: 'threads',
        },
        onDelete: 'CASCADE',
      },
    ],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
