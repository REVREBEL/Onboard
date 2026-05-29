module.exports = {
  apps: [
    {
      name: "surveyjs-api",
      script: "src/server.js",
      cwd: __dirname,
      env: { NODE_ENV: "production" }
    }
  ]
};
