const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const now = new Date();

    const query = {
      text: 'INSERT INTO threads(id, title, body, date, owner) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, now.toISOString(), owner],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows[0];
  }

  async getThreadByIdWithComments(id) {
    const query = {
      text: `
        SELECT 
          t.id AS "threadId",
          t.title,
          t.body,
          t.date AS "threadDate",
          thread_owner.username AS "threadUsername",
          c.id AS "commentId",
          c.content AS "commentContent",
          c.date AS "commentDate",
          c."isDeleted" AS "commentIsDeleted",
          comment_owner.username AS "commentUsername",
          r.id AS "replyId",
          r.content AS "replyContent",
          r.date AS "replyDate",
          r."isDeleted" AS "replyIsDeleted",
          reply_owner.username AS "replyUsername"
        FROM threads t
        LEFT JOIN users thread_owner ON thread_owner.id = t.owner
        LEFT JOIN comments c ON c."threadId" = t.id
        LEFT JOIN users comment_owner ON comment_owner.id = c.owner
        LEFT JOIN replies r ON r."commentId" = c.id
        LEFT JOIN users reply_owner ON reply_owner.id = r.owner
        WHERE t.id = $1
        ORDER BY c.date ASC, r.date ASC
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows;
  }

  async verifyAvailableThreadById(id) {
    const query = {
      text: 'SELECT 1 FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }
}

module.exports = ThreadRepositoryPostgres;
