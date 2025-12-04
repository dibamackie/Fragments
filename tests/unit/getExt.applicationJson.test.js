const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.ext - JSON conversions', () => {
  let fragmentId;
  const jsonData = { name: 'Alice', age: 30 };
  const user = { email: 'user1@email.com', password: 'password1' };

  beforeAll(async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user.email, user.password)
      .set('Content-Type', 'application/json')
      .send(jsonData);

    fragmentId = postRes.body.fragment.id;
  });

  test('Convert JSON to .json', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.json`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/json');
    expect(JSON.parse(res.text)).toEqual(jsonData);
  });

  test('Convert JSON to .txt', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toContain('"name":"Alice"');
    expect(res.text).toContain('"age":30');
  });

  test('Convert JSON to .yaml', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.yaml`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/yaml');
    expect(res.text).toContain('name: Alice');
    expect(res.text).toContain('age: 30');
  });

  test('Convert JSON to .yml', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.yml`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/yaml');
    expect(res.text).toContain('name: Alice');
    expect(res.text).toContain('age: 30');
  });
});
