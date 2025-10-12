/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'A reply',
    date = new Date().toISOString(),
    owner = 'user-123',
    threadId = 'thread-123',
    commentId = 'comment-123',
    isDeleted = false,
  } = {}) {
    const query = {
      text: 'INSERT INTO replies(id, content, date, owner, "threadId", "commentId", "isDeleted") VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, content, date, owner, threadId, commentId, isDeleted],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
