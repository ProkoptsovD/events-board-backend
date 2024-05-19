import { Request, Response } from 'express';
import { eventsService } from '../services/events.service';
import statusCode from 'http-status-codes';

import { toEventDTO, toEventPreviewDTO } from '../dto/event.mapper';
import { eventsRegistrationService } from '../services/events-registration.service';
import { participantsService } from '../services/participants.service';
import { EVENTS_ALLOWED_VALUES } from '../const';
import { capitalize, normalizeKeys } from '../helpers/shared';

import {
  RegisterToEventSchema,
  EventSearchParamsSchema,
  EventIdSchema,
} from '../validation/event.schema';
import { toRegistrationDTO } from '../dto/registration.mapper';

const getAll = async (req: Request, res: Response) => {
  try {
    const validation = EventSearchParamsSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(statusCode.NOT_ACCEPTABLE).json({
        message: 'Search params validation error',
        issues: validation.error,
      });
    }

    const rawEvents = await eventsService.selectAllEvents(validation.data);
    const totalCount = await eventsService.selectEventsCount();
    const count = rawEvents?.length ?? 0;
    const events = rawEvents?.map(toEventPreviewDTO);

    res.json({ data: { events }, meta: { count, totalCount } });
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

const getOne = async (req: Request, res: Response) => {
  const { id: rawId } = req.params;

  const validation = EventIdSchema.safeParse({ id: rawId });

  if (!validation.success) {
    return res
      .status(statusCode.BAD_REQUEST)
      .json({ message: 'Invalid record ID. Must be number (integer)' });
  }

  try {
    const { id } = validation.data;
    const event = await eventsService.selectEventById(id);
    const data = toEventDTO(event);

    res.json({ data });
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};
const getEventParticipants = async (req: Request, res: Response) => {
  const validation = EventIdSchema.safeParse(req.params);

  if (!validation.success) {
    return res
      .status(statusCode.BAD_REQUEST)
      .json({ message: 'Invalid event ID. Must be number (integer)' });
  }

  try {
    const { id } = validation.data;
    const participants = await eventsService.selectParticipants(id);

    res.json({ data: participants });
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

const registerToEvent = async (req: Request, res: Response) => {
  try {
    const validation = RegisterToEventSchema.safeParse(req.body);

    if (!validation.success) {
      return res
        .status(statusCode.UNPROCESSABLE_ENTITY)
        .json({ message: 'Invalid data', issue: validation.error });
    }

    const { eventId, participant } = validation.data;

    const hasEvent = await eventsService.hasEventRecord(eventId);

    if (!hasEvent) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ message: 'Event not found' });
    }

    const hasAlreadyRegistered =
      await eventsRegistrationService.hasRegistration(
        participant.email,
        eventId
      );

    if (hasAlreadyRegistered) {
      return res.status(statusCode.BAD_REQUEST).json({
        message: `Participant with email ${participant.email} has been already registered to the event.`,
      });
    }

    const participantRecord = await participantsService.selectByEmail(
      participant.email
    );

    if (!participantRecord) {
      const savedParticipant = await participantsService.createParticipant(
        participant
      );

      const registration = await eventsRegistrationService.register(
        eventId,
        savedParticipant!.id
      );

      const data = toRegistrationDTO(registration);

      return res.json({ data });
    }

    const registration = await eventsRegistrationService.register(
      eventId,
      participantRecord!.id
    );

    const data = toRegistrationDTO(registration);

    res.status(statusCode.CREATED).json({ data });
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

const getRegistrationsPerDay = async (req: Request, res: Response) => {
  const validation = EventIdSchema.safeParse(req.params);

  if (!validation.success) {
    return res
      .status(statusCode.BAD_REQUEST)
      .json({ message: 'Invalid event ID. Must be number (integer)' });
  }

  try {
    const { id } = validation.data;
    const stats = await eventsRegistrationService.getRegistrationsPerDay(id);
    const data = stats?.map((stat) => normalizeKeys(stat));

    res.json({ data });
  } catch (err) {
    console.log(err);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

const getSortByOptions = async (_: Request, res: Response) => {
  try {
    const options = EVENTS_ALLOWED_VALUES.sortBy.map((option) => {
      const title = option.replace(/\-/g, ' ');

      return {
        label: capitalize(title),
        value: option,
      };
    });

    res.json({ data: options });
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};
const getChanelOptions = async (_: Request, res: Response) => {
  try {
    const options = EVENTS_ALLOWED_VALUES.eventChanel.map((chanel) => {
      const title = chanel.replace(/\-/g, ' ');

      return {
        label: capitalize(title),
        value: chanel,
      };
    });

    res.json({ data: options });
  } catch (error) {
    console.log(error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

export const eventController = {
  getAll,
  getOne,
  registerToEvent,
  getSortByOptions,
  getChanelOptions,
  getEventParticipants,
  getRegistrationsPerDay,
};
