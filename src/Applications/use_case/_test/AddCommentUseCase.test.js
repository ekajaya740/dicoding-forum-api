const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should add comment correctly', async () => {
    const useCasePayload = {
      content: 'a comment',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const expectedAddedComment = {
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    const mockCommentRepository = {
      addComment: jest.fn().mockImplementation(async (newComment) => ({
        id: 'comment-123',
        content: newComment.content,
        owner: newComment.owner,
      })),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn().mockResolvedValue(),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await addCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyAvailableThreadById)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment)
      .toHaveBeenCalledWith(expect.objectContaining(useCasePayload));
    expect(result).toStrictEqual(expectedAddedComment);
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    const useCasePayload = {
      content: 'a comment',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockCommentRepository = {
      addComment: jest.fn(),
    };
    const mockThreadRepository = {
      verifyAvailableThreadById: jest.fn()
        .mockRejectedValue(new NotFoundError('thread tidak ditemukan')),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow(NotFoundError);

    expect(mockCommentRepository.addComment).not.toHaveBeenCalled();
  });
});
