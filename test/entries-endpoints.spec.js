const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Entries Endpoints', function () {
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

  describe('Token Validation', () => {
    beforeEach('insert users and entries', () =>
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

  // get entries
  describe('GET /api/entries', () => {
    context('Given no entries', () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      );

      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/entries')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context('Given there are entries in the database', () => {
      beforeEach('insert users and entries', () =>
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

  // post new entry
  describe('POST /api/entries', () => {
    beforeEach('insert users and entries', () =>
      helpers.seedUsers(db, testUsers)
    );

    context('Input validation', () => {
      const requiredFields = ['content', 'mood'];
      requiredFields.forEach(field => {
        const testEntry = { ...testEntries[0] };

        it(`reponds with 400 when '${field}' is missing`, () => {
          delete testEntry[field];

          return supertest(app)
            .post('/api/entries')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(testEntry)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });
    });

    context('Happy path', () => {
      it('responds with 201 and a new entry, and creates it in the database', function () {
        this.retries(3);
        const testEntry = testEntries[0];
        return supertest(app)
          .post('/api/entries')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(testEntry)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.content).to.eql(testEntry.content);
            expect(res.body.mood).to.eql(testEntry.mood);
            const expectedDate = new Date().toLocaleString();
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from('shajara_entries')
              .select()
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.content).to.eql(testEntry.content);
                expect(row.mood).to.eql(testEntry.mood);
                expect(row.user_id).to.eql(testEntry.user_id);
                const expectedDate = new Date().toLocaleString();
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);
              }));
      });
    });
  });

  // update an entry
  describe('PATCH /api/entries/:id', () => {
    context('Given no entries', () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(db, testUsers)
      );

      it('responds with 404', () => {
        const entryId = 123456;
        return supertest(app)
          .patch(`/api/entries/${entryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {
            error: 'Entry doesn\'t exist'
          });
      });
    });

    context('Given there are entries in the database', () => {
      beforeEach('insert users and entries', () =>
        helpers.seedEntriesTables(db, testUsers, testEntries)
      );

      context('Input validation', () => {
        it('responds with 400 when no required fields supplied', () => {
          const idToUpdate = 1;
          return supertest(app)
            .patch(`/api/entries/${idToUpdate}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send({ irrelevantField: 'we shoudn\'t get this back' })
            .expect(400, {
              error: 'Request body must contain content'
            });
        });

        it('responds with 204 and updates only a subset of fields', () => {
          const idToUpdate = 1;
          const updateEntry = {
            content: 'New content!',
            mood: 1,
            another: 'What is this?',
            random: 'This should not even be here!',
            burglar: 'WHY ARE YOU IN MY HOUSE?!',
            you: 'wut'
          };
          const expectedEntry = {
            ...testEntries[idToUpdate - 1],
            ...updateEntry
          };
          return supertest(app)
            .patch(`/api/entries/${idToUpdate}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(updateEntry)
            .expect(204)
            .then(() =>
              db
                .from('shajara_entries')
                .select()
                .where({ id: idToUpdate })
                .first()
                .then(row => {
                  expect(row.content).to.eql(expectedEntry.content);
                  expect(row.mood).to.eql(expectedEntry.mood);
                  expect(row).to.not.have.property('another');
                  expect(row).to.not.have.property('random');
                  expect(row).to.not.have.property('burglar');
                  expect(row).to.not.have.property('you');
                })
            );
        });
      });

      context('Happy path', () => {
        it('responds with 204 and updates the entry', () => {
          const idToUpdate = 1;
          const updateEntry = {
            content: 'New content!'
          };
          const expectedEntry = {
            ...testEntries[idToUpdate - 1],
            ...updateEntry
          };
          return supertest(app)
            .patch(`/api/entries/${idToUpdate}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(updateEntry)
            .expect(204)
            .then(() =>
              db
                .from('shajara_entries')
                .select()
                .where({ id: idToUpdate })
                .first()
                .then(row => {
                  expect(row.content).to.eql(expectedEntry.content);
                })
            );
        });
      });
    });
  });
});
