class GetThreadByIdUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    return this._threadRepository.getById(threadId);
  }
}

module.exports = GetThreadByIdUseCase;
