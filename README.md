# Shajara Server
Backend framework providing data to the Shajara app

## Get Started
To spin up a copy of this server:
- Clone this repository
- `cd` into the cloned repo
- Make a fresh start of the git history - `rm -rg .git && git init`
- Install the node dependencies `npm install`
- Move the example environment file to `.env` that will be ignored by git and read by the express server - `mv example.env .env`
- Spin up a development and test database using PSQL
- Include the connection strings to these databases in the `.env` file
- Run the migrations using **Postgrator** - `npm run migrate && npm run migrate:test`
- You're ready to go! Well, right after you run `npm start` 😅


## Endpoints
### `GET /`
This is just a stub to check the status of the server.

#### Response: `200 OK`
```JSON
Shajara lives here
```
---

### `GET /api`
Returns a list of the available endpoints.

#### Response: `200 OK`
```JSON
{
  "endpoints": [
    "/api/users",
    "/api/auth",
    "/api/entries"
  ]
}
```
---

### `POST /api/users`
Creates new user accounts in the database. This requires a JSON Object with `first_name`, `email_address` and `password` in the request body.

#### Response: `200 OK`
```JSON
{
    "id": 3,
    "first_name": "Test",
    "email_address": "test@shajara.now.sh",
    "date_created": "2020-04-24T03:29:23.395Z"
}
```
---

### `POST /api/auth/login`
Facilitates logging in by the client. This requires a JSON object with `email_address` (**unique**) and `password` (**8-72 characters with at least 1 uppercase, 1 lowercase, and 1 number**) in the request body.

#### Response: `200 OK`
```JSON
{
    "first_name": "Test",
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJpYXQiOjE1ODc2OTkxMjQsInN1YiI6InRlc3RAc2hhamFyYS5ub3cuc2gifQ.UMxOAEq_DnkrNp4YDk6OD0nBQ77ghfgxmU-KD7FKONw"
}
```
---

###  `POST /api/entries`
Creates an entry in the database. This requires an `Authorization` header with a Bearer token (received from `POST /api/auth/login`), as well as a JSON object with `content` (_string_) and `mood` (_int_) in the request body.

#### Response: `201 Created`
```JSON
{
    "id": 2,
    "content": "Entry content...",
    "mood": 5,
    "date_created": "2020-04-24T11:44:56.493Z"
}
```
---

###  `PATCH /api/entries/:entry_id`
Updates an entry in the database. This requires an `Authorization` header with a Bearer token (received from `POST /api/auth/login`), as well as a JSON object with either `content` or `mood` in the request body.

#### Response: `204 No Content`
---

### `GET /api/entries`
Returns an array of entries by the user matched using the token. This requires an `Authorization` header with a Bearer token (received from `POST /api/auth/login`).

#### Response: `200 OK`
```JSON
[
  {
    "id": 1,
    "content": "Entry content...",
    "mood": 5,
    "date_created": "2020-04-23T11:44:56.493Z"
  },
  {
    "id": 2,
    "content": "Different entry content...",
    "mood": 5,
    "date_created": "2020-04-24T11:44:56.493Z"
  },
]
```
---

### Errors
You gotta love 'em! 🙄<br>
Any error response from the server ( `HTTP Response 400-404/500` ) comes in the format below:
```JSON
{
  "error": "This is an example"
}
```
---

## Technologies Used
- Shajara Server is built on Node.js, Express and PSQL.
- It makes use of Knex for querying.