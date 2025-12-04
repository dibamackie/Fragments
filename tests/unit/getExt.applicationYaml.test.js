const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.ext - YAML conversions', () => {
  let fragmentId;
  const yamlData = `name: Alice\nage: 30\n`;
  const user = { email: 'user1@email.com', password: 'password1' };

  beforeAll(async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user.email, user.password)
      .set('Content-Type', 'application/yaml')
      .send(yamlData);

    fragmentId = postRes.body.fragment.id;
  });

  test('Convert YAML to .yaml', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.yaml`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/yaml');
    expect(res.text).toContain('name: Alice');
    expect(res.text).toContain('age: 30');
  });

  test('Convert YAML to .txt', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toContain('name: Alice');
    expect(res.text).toContain('age: 30');
  });
});
