const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error when invoke unimplemented addLike', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.addLike({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented removeLike', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.removeLike('like-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented getLikeByOwnerAndComment', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.getLikeByOwnerAndComment('user-123', 'comment-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented getLikesByCommentId', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.getLikesByCommentId('comment-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented verifyCommentExists', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.verifyCommentExists('comment-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented verifyUserExists', async () => {
    const likeRepository = new LikeRepository();

    await expect(likeRepository.verifyUserExists('user-123')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
