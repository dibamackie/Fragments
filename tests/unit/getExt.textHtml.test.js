const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.ext - HTML conversions', () => {
  let fragmentId;
  const htmlData = '<h1>Hello</h1><p>This is a <strong>test</strong>.</p>';
  const user = { email: 'user1@email.com', password: 'password1' };

  beforeAll(async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user.email, user.password)
      .set('Content-Type', 'text/html')
      .send(htmlData);

    fragmentId = postRes.body.fragment.id;
  });

  test('Convert HTML to .html', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.text.trim()).toBe(htmlData.trim());
  });

  test('Convert HTML to .txt', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toContain('Hello');
    expect(res.text).toContain('test');
  });
});
