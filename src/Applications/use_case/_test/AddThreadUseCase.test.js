const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should add thread correctly', async () => {
    const useCasePayload = {
      title: 'a thread',
      body: 'thread body',
      owner: 'user-123',
    };

    const expectedAddedThread = {
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    const mockThreadRepository = {
      addThread: jest.fn().mockImplementation(async (newThread) => ({
        id: 'thread-123',
        title: newThread.title,
        owner: newThread.owner,
      })),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await addThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.addThread)
      .toHaveBeenCalledWith(expect.objectContaining(useCasePayload));
    expect(result).toStrictEqual(expectedAddedThread);
  });
});
