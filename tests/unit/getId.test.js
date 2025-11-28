// tests/unit/getFragmentById.test.js

const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

jest.mock('../../src/model/fragment'); // Mock Fragment model

describe('GET /v1/fragments/:id', () => {
  const userEmail = 'user1@email.com';
  const userPassword = 'password1';
  const fragmentId = 'valid-fragment-id';

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${fragmentId}`).expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('invalid@email.com', 'wrongpassword')
      .expect(401));

  test('returns 404 if the fragment does not exist', async () => {
    Fragment.byId.mockRejectedValue(new Error('Fragment not found')); // Simulate fragment not found

    const res = await request(app).get(`/v1/fragments/${fragmentId}`).auth(userEmail, userPassword);

    expect(res.statusCode).toBe(404);
  });

  test('returns 200 and the fragment content if it exists (text-based)', async () => {
    const mockFragment = {
      id: fragmentId,
      type: 'text/plain',
      size: 18,
      isText: true,
      getData: jest.fn().mockResolvedValue(Buffer.from('This is a fragment')),
    };

    Fragment.byId.mockResolvedValue(mockFragment);

    const res = await request(app).get(`/v1/fragments/${fragmentId}`).auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.headers['content-length']).toBe('18');
    expect(res.text).toBe('This is a fragment');
  });

  test('returns 200 and base64-encoded data for non-text fragments', async () => {
    const mockBinaryData = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello" in bytes

    const mockFragment = {
      id: fragmentId,
      type: 'application/octet-stream',
      size: mockBinaryData.length,
      isText: false,
      getData: jest.fn().mockResolvedValue(mockBinaryData),
    };

    await Fragment.byId.mockResolvedValue(mockFragment);

    const res = await request(app).get(`/v1/fragments/${fragmentId}`).auth(userEmail, userPassword);

    console.log(res.headers);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/octet-stream');
  });
});
