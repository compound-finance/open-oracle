import express from 'express';

export function endpoint(path: string, privateKey: string, getter: () => object): express.Application {
  // Create a new express application instance
  const app: express.Application = express();

  app.get(path, function (req, res) {
    res.send('Hello World!');
  });

  return app;
}
