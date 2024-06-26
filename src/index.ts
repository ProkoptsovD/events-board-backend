import express from 'express';
import cors from 'cors';
import eventsRouter from './lib/routes/events.route';

import { connectDb } from './lib/database/db';

const { log } = console;

const port = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.use(eventsRouter);

app.listen(port, async () => {
  log(`Example app listening on port ${port}`);

  await connectDb().catch(console.log);
  log('Connection to db established');
});

export default app;
