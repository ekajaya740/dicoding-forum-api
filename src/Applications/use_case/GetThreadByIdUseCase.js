class GetThreadByIdUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    return this._threadRepository.getThreadByIdWithComments(threadId);
  }
}

module.exports = GetThreadByIdUseCase;
