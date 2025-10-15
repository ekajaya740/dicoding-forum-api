const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

const COMMENT_NOT_FOUND_MESSAGE = DomainErrorTranslator.getMessage('GET_COMMENT.COMMENT_NOT_FOUND');
const AUTHORIZATION_ERROR_MESSAGE = DomainErrorTranslator.getMessage('AUTHORIZATION_ERROR.UNAUTHORIZED');

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
      throw new NotFoundError(COMMENT_NOT_FOUND_MESSAGE);
    }

    const reply = await this._replyRepository.getById(replyId);

    if (reply.commentId !== commentId) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (reply.owner !== userId) {
      throw new AuthorizationError(AUTHORIZATION_ERROR_MESSAGE);
    }

    return this._replyRepository.deleteById(replyId);
  }
}

module.exports = DeleteReplyByIdUseCase;
