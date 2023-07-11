import { createServer } from 'http';
import appAsync from '../src/app.js';
import { port } from '../src/cfg.js';

function onError(error) {
  throw error;
}

function onListening() {
  console.log(`Listening on port: ${port}`);
}

appAsync().then((app) => {
  app.set('port', port);
  const server = createServer(app);
  server.listen(port);

  server.on('error', onError);
  server.on('listening', onListening);
});
