const routes = (handler) => ([
  {
    method: 'GET',
    path: '/health',
    handler: handler.getHealthHandler,
  },
]);

module.exports = routes;
