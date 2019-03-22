/* eslint-disable no-undef */
const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(
        200,
        {
          message: 'API - 👋🌎🌍🌏'
        },
        done
      );
  });
});

describe('POST /api/v1/massages', () => {
  it('Responds with inserted message', (done) => {
    const reqObj = {
      name: 'Jay',
      message: 'This app is great!',
      latitude: -90,
      longitude: 180
    };
    const resObj = {
      ...reqObj,
      _id: '5c9301e38ea4ba35c83f71e0',
      date: '2019-03-21T03:15:47.808Z'
    };
    request(app)
      .post('/api/v1/messages')
      .set('Accept', 'application/json')
      .send(reqObj)
      .expect('Content-Type', /json/)
      .expect((res) => {
        res.body._id = '5c9301e38ea4ba35c83f71e0';
        res.body.date = '2019-03-21T03:15:47.808Z';
      })
      .expect(200, resObj, done);
  });
});
