class DeleteCommentByIdUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({
    commentId,
    threadId,
    userId,
  }) {
    await this._threadRepository.verifyAvailableThreadById(threadId);
    await this._commentRepository.verifyCommentByOwner(commentId, userId);
    return this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentByIdUseCase;
