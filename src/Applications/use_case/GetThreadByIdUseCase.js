class GetThreadByIdUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    const rows = await this._threadRepository.getThreadByIdWithComments(threadId);
    if (!rows.length) {
      return null;
    }

    const threadRow = rows[0];
    const commentsMap = new Map();

    rows.forEach((row) => {
      if (!row.commentId) {
        return;
      }

      if (!commentsMap.has(row.commentId)) {
        commentsMap.set(row.commentId, {
          id: row.commentId,
          content: row.commentIsDeleted ? '**komentar telah dihapus**' : row.commentContent,
          date: row.commentDate,
          username: row.commentUsername,
          isDeleted: row.commentIsDeleted,
          replies: [],
        });
      }

      if (!row.replyId) {
        return;
      }

      const comment = commentsMap.get(row.commentId);
      comment.replies.push({
        id: row.replyId,
        content: row.replyIsDeleted ? '**balasan telah dihapus**' : row.replyContent,
        date: row.replyDate,
        username: row.replyUsername,
        isDeleted: row.replyIsDeleted,
      });
    });

    const comments = Array.from(commentsMap.values());

    return {
      id: threadRow.threadId,
      title: threadRow.title,
      body: threadRow.body,
      date: threadRow.threadDate,
      username: threadRow.threadUsername,
      comments,
    };
  }
}

module.exports = GetThreadByIdUseCase;
