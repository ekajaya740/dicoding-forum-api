const NewReply = require('../NewReply');

describe('a NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'a reply',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 'a reply',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 456,
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    const payload = {
      content: 'a reply',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const newReply = new NewReply(payload);

    expect(newReply.content).toEqual(payload.content);
    expect(newReply.owner).toEqual(payload.owner);
    expect(newReply.threadId).toEqual(payload.threadId);
    expect(newReply.commentId).toEqual(payload.commentId);
  });
});
