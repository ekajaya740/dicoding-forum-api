const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const registerAndLoginUser = async (server, userPayload = {
  username: 'dicoding',
  password: 'secret',
  fullname: 'Dicoding Indonesia',
}) => {
  const registerResponse = await server.inject({
    method: 'POST',
    url: '/users',
    payload: userPayload,
  });
  const registerJson = JSON.parse(registerResponse.payload);
  const { addedUser } = registerJson.data;

  const loginResponse = await server.inject({
    method: 'POST',
    url: '/authentications',
    payload: {
      username: userPayload.username,
      password: userPayload.password,
    },
  });
  const loginJson = JSON.parse(loginResponse.payload);

  return {
    accessToken: loginJson.data.accessToken,
    userId: addedUser.id,
  };
};

describe('/threads endpoint', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should respond 201 and persist thread when payload valid', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await registerAndLoginUser(server, {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'A thread',
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
      const { id: threadId } = responseJson.data.addedThread;

      const threads = await ThreadsTableTestHelper.findThreadById(threadId);
      expect(threads).toHaveLength(1);
      expect(threads[0].owner).toEqual(userId);
      expect(threads[0].title).toEqual('A thread');
    });

    it('should respond 400 when payload does not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding2',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 400 when payload has invalid data type', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding3',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 123,
          body: 'Thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should respond 401 when request not authenticated', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'A thread',
          body: 'Thread body',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respond 200 and return thread detail with comments and replies', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'john' });
      await UsersTableTestHelper.addUser({ id: 'user-3', username: 'jane' });

      const threadDate = new Date('2024-01-01T00:00:00.000Z').toISOString();
      const commentDate1 = new Date('2024-01-02T00:00:00.000Z').toISOString();
      const commentDate2 = new Date('2024-01-03T00:00:00.000Z').toISOString();
      const replyDate1 = new Date('2024-01-04T00:00:00.000Z').toISOString();
      const replyDate2 = new Date('2024-01-05T00:00:00.000Z').toISOString();
      const replyDate3 = new Date('2024-01-06T00:00:00.000Z').toISOString();

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'A Thread',
        body: 'Thread body',
        owner: 'user-1',
        date: threadDate,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'First comment',
        owner: 'user-2',
        threadId: 'thread-123',
        date: commentDate1,
        isDeleted: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        content: 'Second comment',
        owner: 'user-3',
        threadId: 'thread-123',
        date: commentDate2,
        isDeleted: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        content: 'First reply',
        owner: 'user-3',
        threadId: 'thread-123',
        commentId: 'comment-123',
        date: replyDate1,
        isDeleted: false,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-124',
        content: 'Deleted reply',
        owner: 'user-2',
        threadId: 'thread-123',
        commentId: 'comment-123',
        date: replyDate2,
        isDeleted: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-125',
        content: 'Reply on deleted comment',
        owner: 'user-2',
        threadId: 'thread-123',
        commentId: 'comment-124',
        date: replyDate3,
        isDeleted: false,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      const { thread } = responseJson.data;
      expect(thread).toMatchObject({
        id: 'thread-123',
        title: 'A Thread',
        body: 'Thread body',
        date: threadDate,
        username: 'dicoding',
      });
      expect(thread.comments).toHaveLength(2);
      const [firstComment, secondComment] = thread.comments;
      expect(firstComment).toMatchObject({
        id: 'comment-123',
        content: 'First comment',
        date: commentDate1,
        username: 'john',
        isDeleted: false,
      });
      expect(firstComment.replies).toHaveLength(2);
      expect(firstComment.replies[0]).toMatchObject({
        id: 'reply-123',
        content: 'First reply',
        date: replyDate1,
        username: 'jane',
        isDeleted: false,
      });
      expect(firstComment.replies[1]).toMatchObject({
        id: 'reply-124',
        content: '**balasan telah dihapus**',
        date: replyDate2,
        username: 'john',
        isDeleted: true,
      });
      expect(secondComment).toMatchObject({
        id: 'comment-124',
        content: '**komentar telah dihapus**',
        date: commentDate2,
        username: 'jane',
        isDeleted: true,
      });
      expect(secondComment.replies).toHaveLength(1);
      expect(secondComment.replies[0]).toMatchObject({
        id: 'reply-125',
        content: 'Reply on deleted comment',
        date: replyDate3,
        username: 'john',
        isDeleted: false,
      });
    });

    it('should respond 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-404',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
