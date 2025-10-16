const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyByIdUseCase = require('../../../../Applications/use_case/DeleteReplyByIdUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const addedReply = await addReplyUseCase.execute({
      ...request.payload,
      owner,
      threadId,
      commentId,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyByIdUseCase = this._container.getInstance(DeleteReplyByIdUseCase.name);
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    await deleteReplyByIdUseCase.execute({
      threadId,
      commentId,
      replyId,
      userId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
