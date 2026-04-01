module.exports = {
  apps: [
    {
      name: "aite-cbt",
      script: "node_modules/.bin/next",
      args: "start -p 82",
      cwd: "/home/hutechc/_ALL_CODES/AITe_CBT",
      env: {
        NODE_ENV: "production",
        PORT: 82,
      },
    },
  ],
};
