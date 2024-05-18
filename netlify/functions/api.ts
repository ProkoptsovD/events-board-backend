import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

import eventsRouter from '../../src/lib/routes/events.route';
import { connectDb } from '../../src/lib/database/db';

const app = express();

app.use(cors());
app.use(express.json());

app.use(eventsRouter);

connectDb();

export const handler = serverless(app);
