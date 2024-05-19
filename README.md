## How run the project

### Prerequisites

1. Node.js >= 18.18.0
2. Docker

### Launch project

#### STEP 1

1. Install project's dependencies by running `npm install`
2. Create file `.env` and copy/paste all from `.env.example` file to it. Or just rename `.env.example` to `.env`. Those env variable are needed for db connection. Of course, normally you do not store them on GitHub, but as it test project I put envs to `.env.example` file.

#### STEP 2

In case you do not want to install database or docker on you computer, then jut skip this step

1. Open (launch) Docker
2. Run command `docker pull postgres` - this will install Postgres database on the computer
3. Run command `npm run db:docker-up` - this will start database server
4. Run command `npm run db:seed-dev` - this will seed database with data

#### STEP 3

After seeding db or skipping prev steps you need actually launch project by starting server:

- For development with local database run `npm run dev`.
- For development with remote (prod) database run `npm run server`

! `IMPORTANT`
This project does not support hot reload, so for every change you need save changed files, stop server and run `npm run dev` again

Happy coding!
