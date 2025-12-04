const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  const userEmail = 'user1@email.com';
  const userPassword = 'password1';
  const initialData = 'Initial data';
  const updatedData = 'This is updated data';

  let fragmentId;

  // Create a new fragment before each test
  beforeEach(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send(initialData);

    fragmentId = res.body.fragment.id;
  });

  test('unauthenticated requests are denied', async () => {
    await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .set('Content-Type', 'text/plain')
      .send(updatedData)
      .expect(401);
  });

  test('returns 404 if the fragment does not exist', async () => {
    await request(app)
      .put('/v1/fragments/non-existent-id')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send(updatedData)
      .expect(404);
  });

  test('returns 400 if Content-Type does not match existing fragment', async () => {
    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, userPassword)
      .set('Content-Type', 'application/json') // Different from original
      .send(JSON.stringify({ data: 'invalid' }));

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe('Content-Type does not match the existing fragment type.');
  });

  test('successfully updates fragment content and metadata', async () => {
    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragmentId);
    expect(res.body.fragment.size).toBe(updatedData.length);
  });

  test('returns 400 if the body is not a buffer or is empty', async () => {
    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send('');

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe('Invalid body format, expected raw binary data.');
  });
});
