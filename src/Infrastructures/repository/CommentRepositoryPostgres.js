const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, owner, threadId } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const now = new Date();

    const query = {
      text: 'INSERT INTO comments(id, content, date, owner, "threadId") VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, now.toISOString(), owner, threadId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET "isDeleted" = true WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    return id;
  }

  async verifyCommentByOwner(commentId, owner) {
    const comment = await this.getCommentById(commentId);

    if (comment.owner !== owner) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = CommentRepositoryPostgres;
