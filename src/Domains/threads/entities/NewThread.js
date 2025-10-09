class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.title = payload.title;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { title, owner } = payload;

    if (!title || !owner) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

}

module.exports = NewThread;