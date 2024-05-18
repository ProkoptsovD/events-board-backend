CREATE TABLE IF NOT EXISTS events(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  event_date DATE,
  organizer VARCHAR(255),
  cost FLOAT,
  image TEXT,

  venue_id INT,
  external_id INT NULL
);

CREATE TABLE IF NOT EXISTS participants(
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(100),
  birth_date DATE,
  event_channel VARCHAR(50),

  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  address VARCHAR(255),

  external_id INT NULL,
  UNIQUE (name, city, state, country)
);

CREATE TABLE IF NOT EXISTS external_events (
  id SERIAL PRIMARY KEY,
  seatgeek_id INT
);

CREATE TABLE IF NOT EXISTS external_venues (
  id SERIAL PRIMARY KEY,
  seatgeek_id INT
);

CREATE TABLE IF NOT EXISTS event_registration (
  event_id INT,
  participant_id INT,
  registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, participant_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);
