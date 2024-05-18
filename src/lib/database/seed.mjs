import fs from 'node:fs/promises';
import pg from 'pg';
import { faker } from '@faker-js/faker';

import { configDev, configProd } from './config.js';

const isProductionMode = process.env.NODE_ENV === 'production';

const config = isProductionMode ? configProd : configDev;

export const db = new pg.Pool(config);

const createVenues = async (venues) => {
  let count = 0;

  for (const venue of venues) {
    console.log('Create venue ', (count += 1), ' of ', venues.length);
    const storedVenue = await db.query(
      `SELECT id FROM external_venues WHERE seatgeek_id = $1`,
      [venue.id]
    );

    if (storedVenue.rowCount > 0) continue;

    const { id, ...restVenue } = venue;

    const result = await db.query(
      `
        INSERT INTO external_venues (seatgeek_id)
        VALUES ($1)
        RETURNING id;
    `,
      [id]
    );

    const referenceId = await result.rows[0]?.id;
    restVenue.external_id = referenceId;

    const { keys, values, parameterizedKeys } =
      prepareSQLInsertionData(restVenue);

    await db.query(
      `
      INSERT INTO venues (${keys.join(', ')})
      VALUES (${parameterizedKeys.join(', ')});
  `,
      values
    );

    console.log('Venue ', count, ' created');
  }
};

const createEvents = async (events) => {
  let count = 0;

  for (const event of events) {
    console.log('Create event ', (count += 1), ' of ', events.length);

    const storedEvent = await db.query(
      `SELECT external_events.id FROM external_events WHERE external_events.seatgeek_id = $1`,
      [event.id]
    );

    if (storedEvent.rowCount > 0) continue;

    const { venue, id: eventId, ...restEvent } = event;

    const storedVenue = await db.query(
      `SELECT external_venues.id FROM external_venues WHERE external_venues.seatgeek_id = $1`,
      [venue.id]
    );

    let venueReferenceId = storedVenue.rows[0]?.id;

    if (storedVenue.rowCount === 0) {
      const { id, ...restVenue } = venue;

      const result = await db.query(
        `
          INSERT INTO external_venues (seatgeek_id)
          VALUES ($1)
          RETURNING id;
        `,
        [id]
      );

      const referenceId = await result.rows[0]?.id;
      restVenue.external_id = referenceId;

      const { keys, values, parameterizedKeys } =
        prepareSQLInsertionData(restVenue);

      const savedVenue = await db.query(
        `
        INSERT INTO venues (${keys.join(', ')})
        VALUES (${parameterizedKeys.join(', ')})
        RETURNING id;
      `,
        values
      );

      venueReferenceId = await savedVenue.rows[0]?.id;
    }

    const result = await db.query(
      `
        INSERT INTO external_events (seatgeek_id)
        VALUES ($1)
        RETURNING id;
    `,
      [eventId]
    );

    const eventReferenceId = await result.rows[0]?.id;

    restEvent.venue_id = venueReferenceId;
    restEvent.external_id = eventReferenceId;

    const { keys, values, parameterizedKeys } =
      prepareSQLInsertionData(restEvent);

    await db.query(
      `
      INSERT INTO events (${keys.join(', ')})
      VALUES (${parameterizedKeys.join(', ')});
  `,
      values
    );

    console.log('Event ', count, ' created');
  }
};

const createParticipants = async (participants) => {
  const eventCountQueryResult = await db.query(
    `
      SELECT *
      FROM events;
    `
  );
  const eventsCount = eventCountQueryResult.rows.length;

  let counter = 0;
  for (const participant of participants) {
    const eventId = randomNumber(1, eventsCount);

    console.log(
      'Creating participant ',
      (counter += 1),
      ' of ',
      participants.length
    );

    console.log('Checking if event exists');
    const eventQueryResult = await db.query(
      `
        SELECT events.id
        FROM events
        WHERE events.id = $1
    `,
      [eventId]
    );

    const hasRecord = eventQueryResult.rows.length > 0;

    if (!hasRecord) {
      console.log('No event found. Skipping...');

      continue;
    }

    console.log('Checking if has been registered for event before');
    const registrationCheckQueryResult = await db.query(
      `
        SELECT *
          FROM participants
          JOIN event_registration
            ON participants.id = event_registration.participant_id
          JOIN events
            ON events.id = event_registration.event_id
          WHERE participants.email = $1
          AND events.id = $2;
      `,
      [participant.email, eventId]
    );

    const hasRegistration = registrationCheckQueryResult.rows.length > 0;

    if (hasRegistration) {
      console.log('Registration found. Skipping...');
      continue;
    }

    console.log('Checking if participant exists');
    const participantQueryResult = await db.query(
      `
        SELECT *
          FROM participants
          WHERE participants.email = $1;
      `,
      [participant.email]
    );

    const participantRecord = await participantQueryResult.rows[0];

    if (!participantRecord) {
      console.log('No participant found. Creating new one...');
      const { keys, values, parameterizedKeys } =
        prepareSQLInsertionData(participant);

      const createParticipantQueryResult = await db.query(
        `
          INSERT INTO participants (${keys.join(', ')})
          VALUES (${parameterizedKeys.join(', ')})
          RETURNING *;
        `,
        values
      );
      console.log('Participant created');

      const savedParticipant = await createParticipantQueryResult.rows[0];

      console.log('Creating registration');
      const registeredAt = faker.date.between({
        from: '2024-04-01T00:00:00.000Z',
        to: new Date(),
      });

      await db.query(
        `
          INSERT INTO event_registration (event_id, participant_id, registered_at)
          VALUES ($1, $2, $3);
        `,
        [eventId, savedParticipant.id, registeredAt]
      );
      console.log('Registration created');
    } else {
      console.log('No participant found. Creating new registration...');
      await db.query(
        `
          INSERT INTO event_registration (event_id, participant_id)
          VALUES ($1, $2);
        `,
        [eventId, participantRecord.id]
      );
      console.log('Registration created');
    }

    console.log('Participant ', counter, ' created');
  }
};

(async () => {
  try {
    console.log('Starting fetch data from third-party server...');
    const data = await fetchEvents(100);
    console.log('Data is successfully fetched');
    console.log('Serializing data. Please, wait...');
    const events = data.map(toEventDatabaseDTO);
    const venues = events.map((event) => event?.venue);
    const participants = generateParticipants(1000);
    console.log('Data is successfully serialized');

    console.log('Running pre-seed SQL commands. Please, wait...');
    await executeSqlFromFile('./src/lib/database/db.sql');
    console.log('Pre-seed SQL commands are successfully executed');

    console.log('Seeding db with data. Please, wait...');

    console.log('Creating venues...');
    await createVenues(venues);
    console.log('Venues are successfully created.');

    console.log('Creating events...');
    await createEvents(events);
    console.log('Events are successfully created.');

    console.log('Creating participants...');
    await createParticipants(participants);
    console.log('Participants are successfully created.');

    console.log('Seeding was successful');
    console.log('Exiting seed...');
  } catch (e) {
    console.log('Seeding failed');
    console.log(e);
  }
})();

// ====== HELPERS ====== //
function prepareSQLInsertionData(obj) {
  const entries = Object.entries(obj);
  const keys = entries.map((entry) => entry[0]);
  const parameterizedKeys = Array.from(
    { length: keys.length },
    (_, index) => `$${index + 1}`
  );
  const values = entries.map((entry) => entry[1]);

  return {
    keys,
    values,
    parameterizedKeys,
  };
}

async function executeSqlFromFile(filePath) {
  try {
    const sqlCommands = (await fs.readFile(filePath, 'utf8'))
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .filter((command) => command.trim() !== '');

    for (const sqlCommand of sqlCommands) {
      await db.query(sqlCommand);
      console.log('SQL command executed successfully:', sqlCommand);
    }

    console.log('All SQL commands executed successfully.');
  } catch (error) {
    console.error('Error executing SQL commands:', error.message);
  }
}

function toEventDatabaseDTO(sourceEvent) {
  const venue = {
    id: sourceEvent.venue?.id,
    name: sourceEvent.venue?.name || '',
    city: sourceEvent.venue?.city || '',
    state: sourceEvent.venue?.state || '',
    country: sourceEvent.venue?.country || '',
    address: sourceEvent.venue?.address || null,
  };

  const eventDTO = {
    id: sourceEvent.id,
    title: sourceEvent.title,
    description:
      sourceEvent.description ||
      faker.lorem.paragraph(Math.floor(Math.random() * 20) + 1),
    event_date: new Date(sourceEvent.datetime_local)
      .toISOString()
      .substring(0, 10),
    organizer: faker.company.name(),
    venue: venue,
    cost: sourceEvent.stats?.average_price ?? 0,
    image: sourceEvent.performers?.[0]?.image || null,
  };

  return eventDTO;
}

function generateParticipants(count) {
  const eventChannels = ['friends', 'social-media', 'found-myself'];

  const participants = Array.from({ length: count }, () => {
    const name = faker.person.firstName() + ' ' + faker.person.lastName();
    const email = faker.internet.email();
    const birth_date = faker.date.birthdate();

    const randomIndex = randomNumber(0, 3);
    const event_channel = eventChannels[randomIndex];

    const participant = {
      name,
      email,
      birth_date,
      event_channel,
    };

    return participant;
  });

  return participants;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

async function fetchEvents(items) {
  const chunks = Array.from({ length: items }, (_, i) => i);

  const data = [];

  const currentDate = new Date();
  const dateOffset = 15;

  currentDate.setDate(currentDate.getDate() + dateOffset);

  const fromDate = formatDateToYYYYMMDD(currentDate);
  const toDate = '2024-12-31';

  for (const _ of chunks) {
    const randomDate = faker.date.between({
      from: fromDate,
      to: toDate,
    });
    const date = formatDateToYYYYMMDD(randomDate);

    console.log('fetch data for request with id:', _);
    const res = await fetch(
      `https://api.seatgeek.com/2/events?client_id=NDE0ODM4NzN8MTcxNTQxNzM2Ny4xNzcyNDU5&per_page=1&datetime_utc.gte=${date}&datetime_utc.lte=2024-12-31`
    );
    const json = await res.json();

    data.push(...json.events);
  }

  const events = await Promise.all(data);

  return events;
}

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
