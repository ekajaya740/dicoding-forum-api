module.exports = {
  apps: [
    {
      name: 'myapp',
      script: 'npm',
      args: 'run start',
      exec_mode: 'fork',
    },
  ],
};
