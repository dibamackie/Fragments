const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.txt for text/plain conversion', () => {
  let fragmentId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('Plain text content');

    fragmentId = res.body.fragment.id;
  });

  test('should return plain text fragment as .txt', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toBe('Plain text content');
  });
});
