import Router from 'express';
import { eventController } from '../controllers/events';

const router = Router();

router.get('/events', eventController.getAll);
router.get('/events/:id', eventController.getOne);
router.post('/events/register', eventController.registerToEvent);
router.get('/events/:id/participants', eventController.getEventParticipants);
router.get(
  '/events/:id/stats/registration',
  eventController.getRegistrationsPerDay
);

router.get('/events/options/sort-by', eventController.getSortByOptions);
router.get('/events/options/event-chanel', eventController.getChanelOptions);

export default router;
