const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Entries Endpoints', function () {
  let db;

  const { testUsers, testEntries } = helpers.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('GET /api/entries', () => {
    context('Token Validation', () => {
      beforeEach('insert things', () =>
        helpers.seedEntriesTables(db, testUsers, testEntries)
      );

      it('responds with 401 \'Missing bearer token\' when no bearer token', () => {
        return supertest(app)
          .get('/api/entries')
          .expect(401, { error: 'Missing bearer token' });
      });

      it('responds 401 \'Unauthorized request\' when no credentials in token', () => {
        const userNoCreds = { email_address: '', password: '' };
        return supertest(app)
          .get('/api/entries')
          .set('Authorization', helpers.makeAuthHeader(userNoCreds))
          .expect(401, { error: 'Unauthorized request' });
      });

      it('responds 401 \'Unauthorized request when invalid user\'', () => {
        const userInvalidCreds = { email_address: 'notreal@fake.com', password: 'NotAPassw0rd' };
        return supertest(app)
          .get('/api/entries')
          .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context('Happy path', () => {
      context('Given no entries', () => {
        beforeEach(() =>
          helpers.seedUsers(db, testUsers)
        );

        it('responds with 200 and an empty list', () => {
          return supertest(app)
            .get('/api/entries')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, []);
        });
      });

      context('Given there are entries in the database', () => {
        beforeEach('insert things', () =>
          helpers.seedEntriesTables(db, testUsers, testEntries)
        );

        it('responds with 200 and an array of entries', () => {
          const expectedEntries = helpers.makeExpectedEntries(testUsers[0], testEntries);
          return supertest(app)
            .get('/api/entries')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, expectedEntries);
        });
      });
    });
  });
});
