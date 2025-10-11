const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newReply = new NewReply(useCasePayload);

    await this._threadRepository.verifyAvailableThreadById(newReply.threadId);

    const comment = await this._commentRepository.getCommentById(newReply.commentId);

    if (comment.threadId !== newReply.threadId) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;
