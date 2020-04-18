const app = require('../src/app');

describe('App', () => {
  
  it('GET /api responds with 200 with a list of endpoints', () => {
    return supertest(app)
      .get('/api')
      .expect(200)
      .then(res => {
        expect(res.body).to.have.property('endpoints');
      });
  });
  
});