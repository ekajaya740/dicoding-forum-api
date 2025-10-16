const autoBind = require('../../../../Commons/utils/autoBind');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentByIdUseCase = require('../../../../Applications/use_case/DeleteCommentByIdUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;
    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      owner,
      threadId,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentByIdUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    await deleteCommentUseCase.execute({
      commentId,
      threadId,
      userId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
