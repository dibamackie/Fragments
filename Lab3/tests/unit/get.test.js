const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  const endpoint = '/v1/fragments';
  const validToken = process.env.VALID_TOKEN || 'Bearer demo-token';

  test('unauthenticated requests are denied', () => {
    return request(app).get(endpoint).expect(401);
  });

  test('requests with invalid credentials are rejected', async () => {
    const response = await request(app)
      .get(endpoint)
      .set('Authorization', 'Bearer invalid');

    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe('error');
    expect(response.body.error.message).toMatch(/invalid/i);
  });

  test('authenticated requests return the available fragments', async () => {
    const response = await request(app)
      .get(endpoint)
      .set('Authorization', validToken);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.fragments).toBeDefined();
    expect(Array.isArray(response.body.fragments)).toBe(true);
    expect(response.body.fragments.length).toBeGreaterThan(0);
  });
});
