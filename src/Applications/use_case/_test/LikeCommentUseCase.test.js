const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should like comment correctly when user has not liked it before', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikesRepository = {
      getLikeByOwnerAndComment: jest.fn().mockResolvedValue(null),
      addLike: jest.fn().mockResolvedValue(),
      removeLike: jest.fn(),
    };
    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const likeCommentUseCase = new LikeCommentUseCase({
      likesRepository: mockLikesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await likeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikesRepository.getLikeByOwnerAndComment)
      .toHaveBeenCalledWith(useCasePayload.owner, useCasePayload.commentId);
    expect(mockLikesRepository.addLike)
      .toHaveBeenCalledWith(expect.objectContaining({
        owner: useCasePayload.owner,
        commentId: useCasePayload.commentId,
        date: expect.any(String),
      }));
    expect(mockLikesRepository.removeLike).not.toHaveBeenCalled();
    expect(result).toStrictEqual({ status: 'success' });
  });

  it('should unlike comment correctly when user has liked it before', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const existingLike = {
      id: 'like-123',
      owner: 'user-123',
      commentId: 'comment-123',
      date: '2024-01-01T00:00:00.000Z',
    };

    const mockLikesRepository = {
      getLikeByOwnerAndComment: jest.fn().mockResolvedValue(existingLike),
      addLike: jest.fn(),
      removeLike: jest.fn().mockResolvedValue(),
    };
    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const likeCommentUseCase = new LikeCommentUseCase({
      likesRepository: mockLikesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await likeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikesRepository.getLikeByOwnerAndComment)
      .toHaveBeenCalledWith(useCasePayload.owner, useCasePayload.commentId);
    expect(mockLikesRepository.removeLike)
      .toHaveBeenCalledWith(existingLike.id);
    expect(mockLikesRepository.addLike).not.toHaveBeenCalled();
    expect(result).toStrictEqual({ status: 'success' });
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikesRepository = {
      getLikeByOwnerAndComment: jest.fn(),
      addLike: jest.fn(),
      removeLike: jest.fn(),
    };
    const mockCommentRepository = {
      verifyCommentExists: jest.fn(),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn()
        .mockRejectedValue(new NotFoundError('thread tidak ditemukan')),
    };

    const likeCommentUseCase = new LikeCommentUseCase({
      likesRepository: mockLikesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(likeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow(NotFoundError);

    expect(mockCommentRepository.verifyCommentExists).not.toHaveBeenCalled();
    expect(mockLikesRepository.getLikeByOwnerAndComment).not.toHaveBeenCalled();
    expect(mockLikesRepository.addLike).not.toHaveBeenCalled();
    expect(mockLikesRepository.removeLike).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when comment does not exist', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockLikesRepository = {
      getLikeByOwnerAndComment: jest.fn(),
      addLike: jest.fn(),
      removeLike: jest.fn(),
    };
    const mockCommentRepository = {
      verifyCommentExists: jest.fn()
        .mockRejectedValue(new NotFoundError('komentar tidak ditemukan')),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const likeCommentUseCase = new LikeCommentUseCase({
      likesRepository: mockLikesRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(likeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow(NotFoundError);

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockLikesRepository.getLikeByOwnerAndComment).not.toHaveBeenCalled();
    expect(mockLikesRepository.addLike).not.toHaveBeenCalled();
    expect(mockLikesRepository.removeLike).not.toHaveBeenCalled();
  });
});
