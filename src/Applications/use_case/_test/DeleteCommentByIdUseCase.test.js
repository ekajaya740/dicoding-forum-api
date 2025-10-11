const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const DeleteCommentByIdUseCase = require('../DeleteCommentByIdUseCase');

describe('DeleteCommentByIdUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    const mockCommentRepository = {
      deleteCommentById: jest.fn().mockResolvedValue(),
      verifyCommentByOwner: jest.fn().mockResolvedValue(),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };
    const deleteCommentByIdUseCase = new DeleteCommentByIdUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    await deleteCommentByIdUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentByOwner)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.deleteCommentById)
      .toHaveBeenCalledWith(useCasePayload.commentId);
  });

  it('should throw AuthorizationError when comment is not owned by requester', async () => {
    const mockCommentRepository = {
      deleteCommentById: jest.fn(),
      verifyCommentByOwner: jest.fn()
        .mockRejectedValue(new AuthorizationError('anda tidak berhak mengakses resource ini')),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };
    const deleteCommentByIdUseCase = new DeleteCommentByIdUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-456',
    };

    await expect(deleteCommentByIdUseCase.execute(useCasePayload))
      .rejects
      .toThrow('anda tidak berhak mengakses resource ini');

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentByOwner)
      .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.deleteCommentById)
      .not
      .toHaveBeenCalled();
  });
});
