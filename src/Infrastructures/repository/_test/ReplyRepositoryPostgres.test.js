const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'A comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const newReply = {
        content: 'A reply',
        owner: 'user-456',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toBe(newReply.content);
      expect(replies[0].owner).toBe(newReply.owner);
      expect(replies[0].threadId).toBe(newReply.threadId);
      expect(replies[0].commentId).toBe(newReply.commentId);
      expect(addedReply).toEqual({
        id: 'reply-123',
        content: newReply.content,
        owner: newReply.owner,
      });
    });
  });

  describe('getById function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.getById('reply-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return reply row correctly when reply exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'A comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const replyDate = new Date('2024-01-05T00:00:00.000Z').toISOString();
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Existing reply',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        date: replyDate,
        isDeleted: false,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      const reply = await replyRepositoryPostgres.getById('reply-123');

      // Assert
      expect(reply).toEqual({
        id: 'reply-123',
        content: 'Existing reply',
        date: replyDate,
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        isDeleted: false,
      });
    });
  });

  describe('deleteById function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.deleteById('reply-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should mark reply as deleted and return reply id when reply exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'A comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Existing reply',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        isDeleted: false,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action
      const deletedReplyId = await replyRepositoryPostgres.deleteById('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(deletedReplyId).toBe('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].isDeleted).toBe(true);
    });
  });

  describe('verifyReplyByOwner function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyByOwner('reply-404', 'user-123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner mismatch', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'A comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Existing reply',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyByOwner('reply-123', 'user-456'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'A comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'Existing reply',
        owner: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyByOwner('reply-123', 'user-123'))
        .resolves.not.toThrow();
    });
  });
});
