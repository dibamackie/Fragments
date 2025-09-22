const request = require('supertest');
const app = require('../../src/app');

describe('app 404 handler', () => {
  test('returns 404 JSON error for unknown route', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found'
      }
    });
  });
});
