const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', function() {
  let db;

  const { testUsers } = helpers.makeFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/auth/login', () => {
    beforeEach('insert users', () => 
      helpers.seedUsers(db, testUsers)
    );

    context('Credential validation', () => {
      const requiredFields = ['email_address', 'password'];
      requiredFields.forEach(field => {
        const loginAttemptBody = {
          email_address: testUser.email_address,
          password: testUser.password
        };

        it(`responds with 400 when '${field}' is missing`, () => {
          delete loginAttemptBody[field];

          return supertest(app)
            .post('/api/auth/login')
            .send(loginAttemptBody)
            .expect(400, { error: `Missing '${field}' in request body` });
        });
      });

      it('responds with 400 when bad email address', () => {
        const userInvalidEmail = {
          email_address: 'notreal@fake.com',
          password: 'D0es1tEvenMatter'
        };
        return supertest(app)
          .post('/api/auth/login')
          .send(userInvalidEmail)
          .expect(400, { error: 'Incorrect email address or password' });
      });

      it('responds with 400 when bad password', () => {
        const userInvalidPass = {
          ...testUser,
          password: 'ThereIsOnlyA0.00001%ChanceThatThisIsCorrect'
        };
        return supertest(app)
          .post('/api/auth/login')
          .send(userInvalidPass)
          .expect(400, { error: 'Incorrect email address or password' });
      });
    });

    context('Happy path', () => {
      it('responds with 200 and JWT auth token using secret when valid credentials', () => {
        const expectedToken = jwt.sign(
          { user_id: testUser.id }, // payload
          process.env.JWT_SECRET,
          {
            subject: testUser.email_address,
            algorithm: 'HS256'
          }
        );
        return supertest(app)
          .post('/api/auth/login')
          .send(testUser)
          .expect(200, {
            first_name: testUser.first_name,
            authToken: expectedToken
          });
      });
    });
  });
});