const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.ext - Markdown conversions', () => {
  let fragmentId;
  const markdownData = '# Sample Markdown\n\nThis is **bold** and this is *italic*.';
  const user = { email: 'user1@email.com', password: 'password1' };

  beforeAll(async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user.email, user.password)
      .set('Content-Type', 'text/markdown')
      .send(markdownData);

    fragmentId = postRes.body.fragment.id;
  });

  test('Convert Markdown to .md', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.md`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/markdown');
    expect(res.text.trim()).toBe(markdownData.trim());
  });

  test('Convert Markdown to .html', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html');
    expect(res.text).toContain('<h1>Sample Markdown</h1>');
    expect(res.text).toContain('<strong>bold</strong>');
  });

  test('Convert Markdown to .txt', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toContain('Sample Markdown');
    expect(res.text).toContain('bold');
  });
});
