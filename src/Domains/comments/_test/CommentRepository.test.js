const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoke unimplemented addComment', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.addComment({})).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented getCommentById', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.getCommentById('comment-123')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented deleteCommentById', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.deleteCommentById('comment-123')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke unimplemented verifyCommentByOwner', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.verifyCommentByOwner('comment-123', 'user-123')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
