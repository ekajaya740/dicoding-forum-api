const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like and return added like correctly', async () => {
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
      const newLike = {
        owner: 'user-456',
        commentId: 'comment-123',
        date: '2024-01-01T00:00:00.000Z',
      };
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      const addedLike = await likeRepositoryPostgres.addLike(newLike);

      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].owner).toBe(newLike.owner);
      expect(likes[0].commentId).toBe(newLike.commentId);
      expect(likes[0].date).toBe(newLike.date);
      expect(addedLike).toEqual({
        id: 'like-123',
        owner: newLike.owner,
        commentId: newLike.commentId,
      });
    });
  });

  describe('removeLike function', () => {
    it('should throw NotFoundError when like not found', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      await expect(likeRepositoryPostgres.removeLike('like-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should delete like and return like id when like exists', async () => {
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
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        owner: 'user-123',
        commentId: 'comment-123',
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      const deletedLikeId = await likeRepositoryPostgres.removeLike('like-123');

      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(deletedLikeId).toBe('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeByOwnerAndComment function', () => {
    it('should return null when like not found', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      const like = await likeRepositoryPostgres.getLikeByOwnerAndComment('user-123', 'comment-123');

      expect(like).toBeUndefined();
    });

    it('should return like correctly when like exists', async () => {
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
      const likeDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        owner: 'user-123',
        commentId: 'comment-123',
        date: likeDate,
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      const like = await likeRepositoryPostgres.getLikeByOwnerAndComment('user-123', 'comment-123');

      expect(like).toEqual({
        id: 'like-123',
        owner: 'user-123',
        commentId: 'comment-123',
        date: likeDate,
      });
    });
  });

  describe('getLikesByCommentId function', () => {
    it('should return empty array when no likes found', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      const likes = await likeRepositoryPostgres.getLikesByCommentId('comment-123');

      expect(likes).toEqual([]);
    });

    it('should return likes sorted by date when likes exist', async () => {
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
      const earlierDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      const laterDate = new Date('2024-01-02T00:00:00.000Z').toISOString();
      await LikesTableTestHelper.addLike({
        id: 'like-456',
        owner: 'user-456',
        commentId: 'comment-123',
        date: laterDate,
      });
      await LikesTableTestHelper.addLike({
        id: 'like-123',
        owner: 'user-123',
        commentId: 'comment-123',
        date: earlierDate,
      });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      const likes = await likeRepositoryPostgres.getLikesByCommentId('comment-123');

      expect(likes).toHaveLength(2);
      expect(likes[0]).toEqual({
        id: 'like-123',
        owner: 'user-123',
        commentId: 'comment-123',
        date: earlierDate,
      });
      expect(likes[1]).toEqual({
        id: 'like-456',
        owner: 'user-456',
        commentId: 'comment-123',
        date: laterDate,
      });
    });
  });

  describe('verifyCommentExists function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      await expect(likeRepositoryPostgres.verifyCommentExists('comment-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw when comment exists', async () => {
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
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      await expect(likeRepositoryPostgres.verifyCommentExists('comment-123'))
        .resolves.not.toThrow();
    });
  });

  describe('verifyUserExists function', () => {
    it('should throw NotFoundError when user not found', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      await expect(likeRepositoryPostgres.verifyUserExists('user-404'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw when user exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => { });

      await expect(likeRepositoryPostgres.verifyUserExists('user-123'))
        .resolves.not.toThrow();
    });
  });
});
