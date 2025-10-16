const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');

describe('GetThreadByIdUseCase', () => {
  it('should get thread detail correctly', async () => {
    const threadId = 'thread-123';
    const rows = [
      {
        threadId,
        title: 'Thread Title',
        body: 'Thread body',
        threadDate: '2024-01-01T00:00:00.000Z',
        threadUsername: 'dicoding',
        commentId: 'comment-123',
        commentContent: 'First comment',
        commentDate: '2024-01-02T00:00:00.000Z',
        commentIsDeleted: false,
        commentUsername: 'john',
        replyId: 'reply-123',
        replyContent: 'First reply',
        replyDate: '2024-01-03T00:00:00.000Z',
        replyIsDeleted: false,
        replyUsername: 'jane',
      },
      {
        threadId,
        title: 'Thread Title',
        body: 'Thread body',
        threadDate: '2024-01-01T00:00:00.000Z',
        threadUsername: 'dicoding',
        commentId: 'comment-123',
        commentContent: 'First comment',
        commentDate: '2024-01-02T00:00:00.000Z',
        commentIsDeleted: false,
        commentUsername: 'john',
        replyId: 'reply-124',
        replyContent: 'Deleted reply',
        replyDate: '2024-01-04T00:00:00.000Z',
        replyIsDeleted: true,
        replyUsername: 'jane',
      },
      {
        threadId,
        title: 'Thread Title',
        body: 'Thread body',
        threadDate: '2024-01-01T00:00:00.000Z',
        threadUsername: 'dicoding',
        commentId: 'comment-124',
        commentContent: 'Second comment',
        commentDate: '2024-01-05T00:00:00.000Z',
        commentIsDeleted: true,
        commentUsername: 'john',
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyIsDeleted: null,
        replyUsername: null,
      },
      {
        threadId,
        title: 'Thread Title',
        body: 'Thread body',
        threadDate: '2024-01-01T00:00:00.000Z',
        threadUsername: 'dicoding',
        commentId: null,
        commentContent: null,
        commentDate: null,
        commentIsDeleted: null,
        commentUsername: null,
        replyId: null,
        replyContent: null,
        replyDate: null,
        replyIsDeleted: null,
        replyUsername: null,
      },
      {
        threadId,
        title: 'Thread Title',
        body: 'Thread body',
        threadDate: '2024-01-01T00:00:00.000Z',
        threadUsername: 'dicoding',
        commentId: 'comment-124',
        commentContent: 'Second comment',
        commentDate: '2024-01-05T00:00:00.000Z',
        commentIsDeleted: true,
        commentUsername: 'john',
        replyId: 'reply-125',
        replyContent: 'Another reply',
        replyDate: '2024-01-06T00:00:00.000Z',
        replyIsDeleted: false,
        replyUsername: 'john',
      },
    ];

    const mockThreadRepository = {
      getThreadByIdWithComments: jest.fn().mockResolvedValue(rows),
    };

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
    });

    const threadDetail = await getThreadByIdUseCase.execute(threadId);

    expect(mockThreadRepository.getThreadByIdWithComments)
      .toHaveBeenCalledWith(threadId);
    expect(threadDetail).toStrictEqual({
      id: threadId,
      title: 'Thread Title',
      body: 'Thread body',
      date: '2024-01-01T00:00:00.000Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          content: 'First comment',
          date: '2024-01-02T00:00:00.000Z',
          username: 'john',
          isDeleted: false,
          replies: [
            {
              id: 'reply-123',
              content: 'First reply',
              date: '2024-01-03T00:00:00.000Z',
              username: 'jane',
              isDeleted: false,
            },
            {
              id: 'reply-124',
              content: '**balasan telah dihapus**',
              date: '2024-01-04T00:00:00.000Z',
              username: 'jane',
              isDeleted: true,
            },
          ],
        },
        {
          id: 'comment-124',
          content: '**komentar telah dihapus**',
          date: '2024-01-05T00:00:00.000Z',
          username: 'john',
          isDeleted: true,
          replies: [
            {
              id: 'reply-125',
              content: 'Another reply',
              date: '2024-01-06T00:00:00.000Z',
              username: 'john',
              isDeleted: false,
            },
          ],
        },
      ],
    });
  });
});
