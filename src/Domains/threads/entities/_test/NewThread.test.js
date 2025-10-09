const { nanoid } = require('nanoid');
const NewThread = require('../NewThread');

describe('a NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'abc',
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 123,
      owner: true,
    };

    // Action and Assert
    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread object correctly', () => {
    userId = `user-${nanoid()}`
    // Arrange
    const payload = {
      title: 'My First Thread',
      owner: userId,
    };

    // Action
    const { title, owner } = new NewThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
