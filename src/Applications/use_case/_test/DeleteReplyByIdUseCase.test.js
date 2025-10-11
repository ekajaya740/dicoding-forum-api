const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DeleteReplyByIdUseCase = require('../DeleteReplyByIdUseCase');

describe('DeleteReplyByIdUseCase', () => {
  const useCasePayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    replyId: 'reply-123',
    userId: 'user-123',
  };

  const mockComment = {
    id: useCasePayload.commentId,
    threadId: useCasePayload.threadId,
  };

  const mockReply = {
    id: useCasePayload.replyId,
    commentId: useCasePayload.commentId,
    owner: useCasePayload.userId,
  };

  it('should orchestrate delete reply action correctly', async () => {
    const mockReplyRepository = {
      getById: jest.fn().mockResolvedValue(mockReply),
      deleteById: jest.fn().mockResolvedValue(useCasePayload.replyId),
    };
    const mockCommentRepository = {
      getCommentById: jest.fn().mockResolvedValue(mockComment),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const deleteReplyByIdUseCase = new DeleteReplyByIdUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyByIdUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentById)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.getById)
      .toHaveBeenCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.deleteById)
      .toHaveBeenCalledWith(useCasePayload.replyId);
  });

  it('should throw NotFoundError when reply does not belong to comment', async () => {
    const mockReplyRepository = {
      getById: jest.fn().mockResolvedValue({
        ...mockReply,
        commentId: 'comment-xyz',
      }),
      deleteById: jest.fn(),
    };
    const mockCommentRepository = {
      getCommentById: jest.fn().mockResolvedValue(mockComment),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const deleteReplyByIdUseCase = new DeleteReplyByIdUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteReplyByIdUseCase.execute(useCasePayload))
      .rejects
      .toThrow(NotFoundError);

    expect(mockReplyRepository.deleteById).not.toHaveBeenCalled();
  });

  it('should throw AuthorizationError when reply is not owned by user', async () => {
    const mockReplyRepository = {
      getById: jest.fn().mockResolvedValue({
        ...mockReply,
        owner: 'user-xyz',
      }),
      deleteById: jest.fn(),
    };
    const mockCommentRepository = {
      getCommentById: jest.fn().mockResolvedValue(mockComment),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const deleteReplyByIdUseCase = new DeleteReplyByIdUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteReplyByIdUseCase.execute(useCasePayload))
      .rejects
      .toThrow(AuthorizationError);

    expect(mockReplyRepository.deleteById).not.toHaveBeenCalled();
  });
});
