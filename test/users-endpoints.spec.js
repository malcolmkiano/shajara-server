const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', function () {
  let db;

  const { testUsers } = helpers.makeFixtures();

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

  describe('POST /api/users', () => {
    const newUser = {
      first_name: 'Tester',
      email_address: 'tester@email.com',
      password: 'TestPassword123'
    };

    context('User Validation', () => {
      beforeEach('Insert users', () =>
        helpers.seedUsers(db, testUsers)
      );

      const requiredFields = ['first_name', 'email_address', 'password'];
      requiredFields.forEach(field => {
        const registerAttemptBody = { ...newUser };

        it(`responds with 400 when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, { error: `Missing '${field}' in request body` });
        });
      });

      it('responds with 400 when password is too short', () => {
        const userShortPassword = {
          ...newUser,
          password: '1234567'
        };
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: 'Password must be longer than 8 characters' });
      });

      it('responds with 400 when password is too long', () => {
        const userLongPassword = {
          ...newUser,
          password: 'TestPassword123'.repeat(5)
        };
        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: 'Password must be less than 72 characters' });
      });

      it('responds with 400 when password starts with spaces', () => {
        const userPasswordStartsSpaces = {
          ...newUser,
          password: ' 1spaceBefore'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds with 400 when password starts with spaces', () => {
        const userPasswordEndsSpaces = {
          ...newUser,
          password: '1spaceAfter '
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 when password isn\'t complex enough', () => {
        const userPasswordNotComplex = {
          ...newUser,
          password: 'password'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, { error: 'Password must contain at least 1 uppercase, lowercase and number characters' });
      });

      it('responds with 400 when email address isn\'t unique', () => {
        const duplicateUser = { ...testUsers[0] };
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, { error: 'Email address already exists' });
      });
    });

    context('Happy path', () => {
      it('responds with 201, serialized user, storing bcrypted password', () => {
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.first_name).to.eql(newUser.first_name);
            expect(res.body.email_address).to.eql(newUser.email_address.toLowerCase());
            expect(res.body).to.not.have.property('password');
            const expectedDate = new Date().toLocaleString();
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from('shajara_users')
              .select()
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.first_name).to.eql(newUser.first_name);
                expect(row.email_address).to.eql(newUser.email_address.toLowerCase());
                const expectedDate = new Date().toLocaleString();
                const actualDate = new Date(row.date_created).toLocaleString();
                expect(actualDate).to.eql(expectedDate);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });

});
