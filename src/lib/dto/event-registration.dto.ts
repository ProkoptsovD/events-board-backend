import { z } from 'zod';
import { RegisterToEventSchema } from '../validation/event.schema';

export type RegisterToEventDTO = z.infer<typeof RegisterToEventSchema>;
