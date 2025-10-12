const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

const registerAndLoginUser = async (server, userPayload) => {
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

const createThread = async (server, accessToken, threadPayload = { title: 'A thread', body: 'Thread body' }) => {
  const response = await server.inject({
    method: 'POST',
    url: '/threads',
    payload: threadPayload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const responseJson = JSON.parse(response.payload);
  return responseJson.data.addedThread.id;
};

describe('/threads/{threadId}/comments endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments', () => {
    it('should respond 201 and persist comment when payload valid', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, userId } = await registerAndLoginUser(server, {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'A comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();

      const comments = await CommentsTableTestHelper
        .findCommentById(responseJson.data.addedComment.id);
      expect(comments).toHaveLength(1);
      expect(comments[0].threadId).toEqual(threadId);
      expect(comments[0].owner).toEqual(userId);
    });

    it('should respond 400 when payload does not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding2',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should respond 400 when payload has invalid data type', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding3',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 123,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should respond 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding4',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-404/comments',
        payload: {
          content: 'A comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should respond 401 when request not authenticated', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: {
          content: 'A comment',
        },
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should respond 200 and soft delete comment', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'A comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addedComment = JSON
        .parse(addCommentResponse.payload).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentById(addedComment.id);
      expect(comments).toHaveLength(1);
      expect(comments[0].isDeleted).toBe(true);
    });

    it('should respond 403 when user not owner of comment', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken: ownerToken } = await registerAndLoginUser(server, {
        username: 'dicoding5',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, ownerToken);
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'A comment',
        },
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });
      const addedComment = JSON.parse(addCommentResponse.payload).data.addedComment;
      const { accessToken: otherUserToken } = await registerAndLoginUser(server, {
        username: 'dicoding6',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${addedComment.id}`,
        headers: {
          Authorization: `Bearer ${otherUserToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses resource ini');
    });

    it('should respond 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding7',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-404`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should respond 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding8',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-404/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
