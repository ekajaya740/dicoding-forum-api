/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    owner = 'user-123',
    commentId = 'comment-123',
    date = new Date().toISOString(),
  } = {}) {
    const query = {
      text: 'INSERT INTO likes(id, owner, "commentId", date) VALUES($1, $2, $3, $4)',
      values: [id, owner, commentId, date],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findLikeByOwnerAndComment(ownerId, commentId) {
    const query = {
      text: 'SELECT * FROM likes WHERE owner = $1 AND "commentId" = $2',
      values: [ownerId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
