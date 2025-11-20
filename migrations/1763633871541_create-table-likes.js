/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    commentId: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
  }, {
    foreignKeys: [{
      columns: 'owner',
      references: {
        schema: 'public',
        name: 'users',
      },
      onDelete: 'CASCADE',
    },
    {
      columns: 'commentId',
      references: {
        schema: 'public',
        name: 'comments',
      },
      onDelete: 'CASCADE',
    }],
  });

  pgm.addConstraint('likes', 'likes_owner_comment_unique', {
    unique: ['owner', 'commentId'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
