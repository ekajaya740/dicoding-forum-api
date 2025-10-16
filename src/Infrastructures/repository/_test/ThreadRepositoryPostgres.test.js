const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const newThread = {
        title: 'A thread',
        body: 'Thread body',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0].title).toBe(newThread.title);
      expect(threads[0].body).toBe(newThread.body);
      expect(threads[0].owner).toBe(newThread.owner);
      expect(addedThread).toEqual({
        id: 'thread-123',
        title: newThread.title,
        owner: newThread.owner,
      });
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return thread row correctly when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      const threadDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread body',
        owner: 'user-123',
        date: threadDate,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toEqual({
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread body',
        date: threadDate,
        owner: 'user-123',
      });
    });
  });

  describe('getThreadByIdWithComments function', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadByIdWithComments('thread-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should return thread with comments and replies correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'dicoding',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-2',
        username: 'john',
      });
      await UsersTableTestHelper.addUser({
        id: 'user-3',
        username: 'jane',
      });

      const threadDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      const commentDate1 = new Date('2024-01-02T00:00:00.000Z').toISOString();
      const commentDate2 = new Date('2024-01-03T00:00:00.000Z').toISOString();
      const replyDate1 = new Date('2024-01-04T00:00:00.000Z').toISOString();
      const replyDate2 = new Date('2024-01-05T00:00:00.000Z').toISOString();
      const replyDate3 = new Date('2024-01-06T00:00:00.000Z').toISOString();

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread body',
        owner: 'user-1',
        date: threadDate,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'First comment',
        date: commentDate1,
        owner: 'user-2',
        threadId: 'thread-123',
        isDeleted: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        content: 'Second comment',
        date: commentDate2,
        owner: 'user-2',
        threadId: 'thread-123',
        isDeleted: true,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'First reply',
        date: replyDate1,
        owner: 'user-3',
        threadId: 'thread-123',
        commentId: 'comment-123',
        isDeleted: false,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-124',
        content: 'Deleted reply',
        date: replyDate2,
        owner: 'user-3',
        threadId: 'thread-123',
        commentId: 'comment-123',
        isDeleted: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-125',
        content: 'Another reply',
        date: replyDate3,
        owner: 'user-2',
        threadId: 'thread-123',
        commentId: 'comment-124',
        isDeleted: false,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action
      const rows = await threadRepositoryPostgres.getThreadByIdWithComments('thread-123');

      // Assert
      expect(rows).toEqual([
        {
          threadId: 'thread-123',
          title: 'Thread Title',
          body: 'Thread body',
          threadDate,
          threadUsername: 'dicoding',
          commentId: 'comment-123',
          commentContent: 'First comment',
          commentDate: commentDate1,
          commentIsDeleted: false,
          commentUsername: 'john',
          replyId: 'reply-123',
          replyContent: 'First reply',
          replyDate: replyDate1,
          replyIsDeleted: false,
          replyUsername: 'jane',
        },
        {
          threadId: 'thread-123',
          title: 'Thread Title',
          body: 'Thread body',
          threadDate,
          threadUsername: 'dicoding',
          commentId: 'comment-123',
          commentContent: 'First comment',
          commentDate: commentDate1,
          commentIsDeleted: false,
          commentUsername: 'john',
          replyId: 'reply-124',
          replyContent: 'Deleted reply',
          replyDate: replyDate2,
          replyIsDeleted: true,
          replyUsername: 'jane',
        },
        {
          threadId: 'thread-123',
          title: 'Thread Title',
          body: 'Thread body',
          threadDate,
          threadUsername: 'dicoding',
          commentId: 'comment-124',
          commentContent: 'Second comment',
          commentDate: commentDate2,
          commentIsDeleted: true,
          commentUsername: 'john',
          replyId: 'reply-125',
          replyContent: 'Another reply',
          replyDate: replyDate3,
          replyIsDeleted: false,
          replyUsername: 'john',
        },
      ]);
    });
  });

  describe('verifyAvailableThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThreadById('thread-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread body',
        owner: 'user-123',
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThreadById('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });
});
