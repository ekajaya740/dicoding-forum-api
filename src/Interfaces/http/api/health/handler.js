class HealthHandler {
  constructor(container) {
    this._container = container;
    this.getHealthHandler = this.getHealthHandler.bind(this);
  }

  async getHealthHandler(request, h) {
    const response = h.response({
      status: 'success',
      data: {
        date: new Date().toISOString(),
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = HealthHandler;
