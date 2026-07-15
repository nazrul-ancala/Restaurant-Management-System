import 'dotenv/config';
import { createServer } from 'http';
import { app } from './app';
import { initSocket } from './lib/socket';

const PORT = process.env.PORT ?? 4000;

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`RMS API listening on port ${PORT}`);
});
