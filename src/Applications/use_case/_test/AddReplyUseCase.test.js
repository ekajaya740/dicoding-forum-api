const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply action correctly', async () => {
    const useCasePayload = {
      content: 'a reply',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const expectedAddedReply = {
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    const mockReplyRepository = {
      addReply: jest.fn().mockImplementation(async (newReply) => ({
        id: 'reply-123',
        content: newReply.content,
        owner: newReply.owner,
      })),
    };
    const mockCommentRepository = {
      getCommentById: jest.fn().mockResolvedValue({
        id: useCasePayload.commentId,
        threadId: useCasePayload.threadId,
      }),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await addReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentById)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply)
      .toHaveBeenCalledWith(expect.objectContaining(useCasePayload));
    expect(result).toStrictEqual(expectedAddedReply);
  });

  it('should throw NotFoundError when comment does not belong to thread', async () => {
    const useCasePayload = {
      content: 'a reply',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockReplyRepository = {
      addReply: jest.fn(),
    };
    const mockCommentRepository = {
      getCommentById: jest.fn().mockResolvedValue({
        id: useCasePayload.commentId,
        threadId: 'thread-xyz',
      }),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrow(NotFoundError);

    expect(mockReplyRepository.addReply).not.toHaveBeenCalled();
  });
});
