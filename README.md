## How run the project

### Prerequisites

1. Node.js >= 18.18.0
2. Docker

### Launch project

In case you do not want to install database or docker on you computer, then jut skip this step

#### STEP 1

1. Open (launch) Docker
2. Run command `docker pull postgres` - this will install Postgres database on the computer
3. Run command `npm run db:docker-up` - this will start database server
4. Run command `npm run db:seed-dev` - this will seed database with data

#### STEP 2

After seeding db or skipping prev steps you need actually launch project by starting server:

- For development with local database run `npm run dev`.
- For development with remote (prod) database run `npm run server`

! `IMPORTANT`
This project does not support hot reload, so for every change you need save changed files, stop server and run `npm run dev` again

Happy coding!
