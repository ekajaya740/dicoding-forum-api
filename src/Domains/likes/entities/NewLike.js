class NewLike {
  constructor(payload) {
    this._verifyPayload(payload);

    this.owner = payload.owner;
    this.commentId = payload.commentId;
    this.date = payload.date;
  }

  _verifyPayload(payload) {
    const {
      owner, commentId, date,
    } = payload;

    if (!owner || !commentId || !date) {
      throw new Error('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' || typeof commentId !== 'string' || typeof date !== 'string') {
      throw new Error('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewLike;
