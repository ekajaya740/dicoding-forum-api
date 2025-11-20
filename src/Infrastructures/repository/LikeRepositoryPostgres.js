const LikeRepository = require('../../Domains/likes/LikeRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

const LIKE_NOT_FOUND_MESSAGE = 'like tidak ditemukan';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(newLike) {
    const {
      owner, commentId, date,
    } = newLike;
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes(id, owner, "commentId", date) VALUES($1, $2, $3, $4) RETURNING id, owner, "commentId"',
      values: [id, owner, commentId, date],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async removeLike(likeId) {
    const query = {
      text: 'DELETE FROM likes WHERE id = $1 RETURNING id',
      values: [likeId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(LIKE_NOT_FOUND_MESSAGE);
    }

    return likeId;
  }

  async getLikeByOwnerAndComment(ownerId, commentId) {
    const query = {
      text: 'SELECT id, owner, "commentId", date FROM likes WHERE owner = $1 AND "commentId" = $2',
      values: [ownerId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getLikesByCommentId(commentId) {
    const query = {
      text: 'SELECT id, owner, "commentId", date FROM likes WHERE "commentId" = $1 ORDER BY date ASC',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyCommentExists(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyUserExists(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('user tidak ditemukan');
    }
  }
}

module.exports = LikeRepositoryPostgres;
