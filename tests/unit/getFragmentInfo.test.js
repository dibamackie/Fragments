// tests/unit/getFragmentInfo.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments/:id/info', () => {
  const fragmentId = 'valid-fragment-id';
  const userEmail = 'user1@email.com';
  const userPassword = 'password1';

  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${fragmentId}/info`).expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth('invalid@email.com', 'wrongpassword')
      .expect(401));

  test('returns 404 if the fragment does not exist', async () => {
    // Simulate fragment not found
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Fragment not found.');
  });

  test('returns 200 and the fragment metadata if it exists', async () => {
    // Simulate a valid fragment
    const mockFragment = {
      id: fragmentId,
      ownerId: 'owner-id',
      created: '2021-11-02T15:09:50.403Z',
      updated: '2021-11-02T15:09:50.403Z',
      type: 'text/plain',
      size: 1024,
    };

    // Mock the Fragment.byId method to return the mock fragment data
    Fragment.byId = jest.fn().mockResolvedValue(mockFragment);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(mockFragment);
  });
});
