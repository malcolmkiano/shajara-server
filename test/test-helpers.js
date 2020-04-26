const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const CryptoService = require('../src/crypto-service');

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'TestA',
      email_address: 'testa@test.com',
      password: 'PasswordA1',
      date_created: new Date('2020-04-01T12:00:00.005Z'),
    },
    {
      id: 2,
      first_name: 'TestB',
      email_address: 'testb@test.com',
      password: 'PasswordB1',
      date_created: new Date('2020-04-02T12:00:00.005Z'),
    },
    {
      id: 3,
      first_name: 'TestC',
      email_address: 'testc@test.com',
      password: 'PasswordC1',
      date_created: new Date('2020-04-03T13:00:00.005Z'),
    },
    {
      id: 4,
      first_name: 'TestD',
      email_address: 'testd@test.com',
      password: 'PasswordD1',
      date_created: new Date('2020-04-02T13:00:00.005Z'),
    },
  ];
}

function makeEntriesArray(users) {
  return [
    {
      id: 1,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      mood: 5,
      user_id: users[0].id,
      date_created: new Date('2020-04-15T16:00:00.005Z').toISOString(),
    },
    {
      id: 2,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      mood: 4,
      user_id: users[1].id,
      date_created: new Date('2020-04-15T16:00:00.005Z').toISOString(),
    },
    {
      id: 3,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      mood: 5,
      user_id: users[2].id,
      date_created: new Date('2020-04-15T16:00:00.005Z').toISOString(),
    },
    {
      id: 4,
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      mood: 3,
      user_id: users[3].id,
      date_created: new Date('2020-04-15T16:00:00.005Z').toISOString(),
    }
  ];
}

function makeExpectedEntries(user, entries) {
  return entries
    .filter(entry => entry.user_id === user.id)
    .map(entry => {
      const serializedEntry = { ...entry };
      delete serializedEntry.user_id;
      return serializedEntry;
    });
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testEntries = makeEntriesArray(testUsers);
  return { testUsers, testEntries };
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        shajara_entries,
        shajara_users
      `
    )
      .then(() =>
        Promise.all([
          trx.raw('ALTER SEQUENCE shajara_entries_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE shajara_users_id_seq minvalue 0 START WITH 1'),
          trx.raw('SELECT setval(\'shajara_entries_id_seq\', 0)'),
          trx.raw('SELECT setval(\'shajara_users_id_seq\', 0)')
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    first_name: CryptoService.encrypt(user.first_name),
    email_address: CryptoService.encrypt(user.email_address),
    password: bcrypt.hashSync(user.password, 1)
  }));

  return db.into('shajara_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        'SELECT setval(\'shajara_users_id_seq\', ?)',
        [users[users.length - 1].id],
      )
    );
}

function seedEntriesTables(db, users, entries) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('shajara_entries').insert(entries);
    // update the auto sequence to match the forced id values
    await trx.raw(
      'SELECT setval(\'shajara_entries_id_seq\', ?)',
      [entries[entries.length - 1].id],
    );
  });
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email_address,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeEntriesArray,
  makeExpectedEntries,

  makeFixtures,
  cleanTables,
  seedEntriesTables,
  makeAuthHeader,
  seedUsers,
};