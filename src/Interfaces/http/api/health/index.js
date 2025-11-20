const routes = require('./routes');
const HealthHandler = require('./handler');

module.exports = {
  name: 'health',
  register: async (server, { container }) => {
    const healthHandler = new HealthHandler(container);
    server.route(routes(healthHandler));
  },
};
