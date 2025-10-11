const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class DeleteReplyByIdUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({
    threadId,
    commentId,
    replyId,
    userId,
  }) {
    await this._threadRepository.verifyAvailableThreadById(threadId);

    const comment = await this._commentRepository.getCommentById(commentId);

    if (comment.threadId !== threadId) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    const reply = await this._replyRepository.getById(replyId);

    if (reply.commentId !== commentId) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (reply.owner !== userId) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }

    return this._replyRepository.deleteById(replyId);
  }
}

module.exports = DeleteReplyByIdUseCase;
