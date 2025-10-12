const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      const newComment = {
        content: 'A comment',
        owner: 'user-123',
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe(newComment.content);
      expect(comments[0].owner).toBe(newComment.owner);
      expect(comments[0].threadId).toBe(newComment.threadId);
      expect(addedComment).toEqual({
        id: 'comment-123',
        content: newComment.content,
        owner: newComment.owner,
      });
    });
  });

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentById('comment-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return comment row correctly when comment exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      const commentDate = new Date('2024-01-02T00:00:00.000Z').toISOString();
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Existing comment',
        date: commentDate,
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById('comment-123');

      // Assert
      expect(comment).toEqual({
        id: 'comment-123',
        content: 'Existing comment',
        date: commentDate,
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: false,
      });
    });
  });

  describe('deleteCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should mark comment as deleted and return comment id when comment exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Existing comment',
        owner: 'user-123',
        threadId: 'thread-123',
        isDeleted: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action
      const deletedCommentId = await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(deletedCommentId).toBe('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].isDeleted).toBe(true);
    });
  });

  describe('verifyCommentByOwner function', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentByOwner('comment-404', 'user-123'))
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
        content: 'Existing comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentByOwner('comment-123', 'user-456'))
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
        content: 'Existing comment',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentByOwner('comment-123', 'user-123'))
        .resolves.not.toThrow();
    });
  });
});
