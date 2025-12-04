const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

jest.mock('../../src/model/fragment');

describe('DELETE /v1/fragments/:id', () => {
  const userEmail = 'user1@email.com';
  const userPassword = 'password1';
  const fragmentId = 'valid-fragment-id';
  const markdownData = '# Hello\nThis is markdown';

  beforeEach(() => {
    jest.clearAllMocks();

    // Universal mocks except Fragment.exists (custom per test)
    Fragment.byId = jest.fn().mockResolvedValue({
      id: fragmentId,
      type: 'text/markdown',
      mimeType: 'text/markdown',
      size: markdownData.length,
      isText: true,
      getData: jest.fn().mockResolvedValue(Buffer.from(markdownData)),
    });

    Fragment.delete = jest.fn().mockResolvedValue();
  });

  test('unauthenticated requests are denied', () =>
    request(app).delete(`/v1/fragments/${fragmentId}`).expect(401));

  test('incorrect credentials are denied', () =>
    request(app).delete(`/v1/fragments/${fragmentId}`).auth('wrong@email.com', 'badpass').expect(401));

  test('returns 404 if fragment does not exist', async () => {
    // Custom mock only for this test
    Fragment.byId.mockResolvedValue(null); // 👈 simulate not found

    const res = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe('Fragment not found');
    expect(res.body.error.message).toBe(404);
  });

  test('successfully deletes the fragment', async () => {

    const res = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, userPassword);

    expect(Fragment.delete).toHaveBeenCalledWith(expect.any(String), fragmentId);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBe(`Fragment ${fragmentId} deleted successfully.`);
  });
});
