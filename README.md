<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS backend for an adaptive testing LMS. It exposes JWT-based authentication, question management, and adaptive test APIs backed by MongoDB.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

Create a `.env` file based on `.env.example` and set:

- `MONGO_URI` MongoDB Atlas connection string
- `JWT_SECRET` secret used to sign access tokens
- `PORT` HTTP port for the server

## Running the server

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:PORT`.

## Seeding questions

To insert 500 sample questions with varying difficulties and weights:

```bash
npm run seed
```

This uses the current `MONGO_URI` value.

## Testing

```bash
npm run test
```

This runs unit tests for the adaptive algorithm and core application code.

## Key models

- `User` name, email, password hash, role (`admin` or `user`).
- `Question` text, options, correct option index, difficulty (1–10), weight.
- `Test` title, description, unique URL key, active flag.
- `TestAttempt` user, test, question snapshots, score, and summary fields.

## Main endpoints

### Auth

- `POST /auth/register` register a new user.
- `POST /auth/login` authenticate and receive a JWT.
- `POST /auth/logout` logical logout used by the frontend.

### Questions (admin, JWT required)

- `POST /questions` create a question.
- `GET /questions` list questions.
- `GET /questions/:id` get a question.
- `PUT /questions/:id` update a question.
- `DELETE /questions/:id` delete a question.

### Tests

- `POST /tests` create a test (admin).
- `GET /tests` list tests (admin).
- `GET /tests/:testId` get a test with aggregate stats (admin).
- `GET /tests/:slug/public` public test details for a unique URL.
- `POST /tests/:testId/start` start or resume an adaptive test for the authenticated user.
- `POST /tests/:testId/questions/answer` submit an answer for the current test and receive the next question or final summary.
