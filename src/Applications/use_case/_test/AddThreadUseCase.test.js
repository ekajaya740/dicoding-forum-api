const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should add thread correctly', async () => {
    const useCasePayload = {
      title: 'a thread',
      body: 'thread body',
      owner: 'user-123',
    };

    const addedThread = {
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue(addedThread),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await addThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.addThread)
      .toHaveBeenCalledWith(expect.objectContaining(useCasePayload));
    expect(result).toStrictEqual(addedThread);
  });
});
