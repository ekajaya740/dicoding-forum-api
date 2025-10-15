const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

const AUTHORIZATION_ERROR_MESSAGE = DomainErrorTranslator.getMessage('AUTHORIZATION_ERROR.UNAUTHORIZED');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const {
      content, owner, threadId, commentId,
    } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const now = new Date();

    const query = {
      text: 'INSERT INTO replies(id, content, date, owner, "threadId", "commentId") VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, now.toISOString(), owner, threadId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getById(id) {
    const query = {
      text: 'SELECT id, content, date, owner, "threadId", "commentId", "isDeleted" FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteById(id) {
    const query = {
      text: 'UPDATE replies SET "isDeleted" = true WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    return id;
  }

  async verifyReplyByOwner(replyId, owner) {
    const reply = await this.getById(replyId);

    if (reply.owner !== owner) {
      throw new AuthorizationError(AUTHORIZATION_ERROR_MESSAGE);
    }
  }
}

module.exports = ReplyRepositoryPostgres;
