const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
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

const createComment = async (server, accessToken, threadId, commentPayload = { content: 'A comment' }) => {
  const response = await server.inject({
    method: 'POST',
    url: `/threads/${threadId}/comments`,
    payload: commentPayload,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const responseJson = JSON.parse(response.payload);
  return responseJson.data.addedComment.id;
};

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should respond 200 and persist like when user like comment', async () => {
      const server = await createServer(container);
      const { accessToken, userId } = await registerAndLoginUser(server, {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);
      const commentId = await createComment(server, accessToken, threadId);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await LikesTableTestHelper.findLikeByOwnerAndComment(userId, commentId);
      expect(likes).toHaveLength(1);
    });

    it('should respond 200 and remove like when user unlike comment', async () => {
      const server = await createServer(container);
      const { accessToken, userId } = await registerAndLoginUser(server, {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);
      const commentId = await createComment(server, accessToken, threadId);

      await LikesTableTestHelper.addLike({
        id: 'like-123',
        owner: userId,
        commentId,
      });

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await LikesTableTestHelper.findLikeByOwnerAndComment(userId, commentId);
      expect(likes).toHaveLength(0);
    });

    it('should respond 404 when comment not found', async () => {
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding2',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });
      const threadId = await createThread(server, accessToken);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment-404/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should respond 404 when thread not found', async () => {
      const server = await createServer(container);
      const { accessToken } = await registerAndLoginUser(server, {
        username: 'dicoding3',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      });

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-404/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should respond 401 when request not authenticated', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});