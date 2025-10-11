const GetThreadByIdUseCase = require('../GetThreadByIdUseCase');

describe('GetThreadByIdUseCase', () => {
  it('should get thread detail correctly', async () => {
    const threadId = 'thread-123';
    const threadDetail = {
      id: threadId,
      title: 'a thread',
      body: 'thread body',
      username: 'dicoding',
      date: '2023-12-01',
      comments: [],
    };

    const mockThreadRepository = {
      getThreadByIdWithComments: jest.fn().mockResolvedValue(threadDetail),
    };

    const getThreadByIdUseCase = new GetThreadByIdUseCase({
      threadRepository: mockThreadRepository,
    });

    const result = await getThreadByIdUseCase.execute(threadId);

    expect(mockThreadRepository.getThreadByIdWithComments)
      .toHaveBeenCalledWith(threadId);
    expect(result).toStrictEqual(threadDetail);
  });
});
