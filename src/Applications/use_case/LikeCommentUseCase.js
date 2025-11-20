const NewLike = require('../../Domains/likes/entities/NewLike');

class LikeCommentUseCase {
  constructor({ likesRepository, commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._likesRepository = likesRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    await this._threadRepository.verifyAvailableThreadById(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const existingLike = await this._likesRepository.getLikeByOwnerAndComment(owner, commentId);

    if (existingLike) {
      await this._likesRepository.removeLike(existingLike.id);
    } else {
      const newLike = new NewLike({
        owner,
        commentId,
        date: new Date().toISOString(),
      });

      await this._likesRepository.addLike(newLike);
    }

    return { status: 'success' };
  }
}

module.exports = LikeCommentUseCase;
