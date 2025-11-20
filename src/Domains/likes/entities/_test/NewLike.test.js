const NewLike = require('../NewLike');

describe('a NewLike entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload1 = {
      commentId: 'comment-123',
      date: '2021-01-01',
    };

    expect(() => new NewLike(payload1)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');

    const payload2 = {
      owner: 'user-123',
      date: '2021-01-01',
    };

    expect(() => new NewLike(payload2)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');

    const payload3 = {
      owner: 'user-123',
      commentId: 'comment-123',
    };

    expect(() => new NewLike(payload3)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');

    const payload4 = {};

    expect(() => new NewLike(payload4)).toThrowError('NEW_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload1 = {
      owner: 123,
      commentId: 'comment-123',
      date: '2021-01-01',
    };

    expect(() => new NewLike(payload1)).toThrowError('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');

    const payload2 = {
      owner: 'user-123',
      commentId: 123,
      date: '2021-01-01',
    };

    expect(() => new NewLike(payload2)).toThrowError('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');

    const payload3 = {
      owner: 'user-123',
      commentId: 'comment-123',
      date: 20210101,
    };

    expect(() => new NewLike(payload3)).toThrowError('NEW_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newLike object correctly', () => {
    const payload = {
      owner: 'user-123',
      commentId: 'comment-123',
      date: '2021-01-01T00:00:00.000Z',
    };

    const newLike = new NewLike(payload);

    expect(newLike.owner).toEqual(payload.owner);
    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.date).toEqual(payload.date);
  });
});
