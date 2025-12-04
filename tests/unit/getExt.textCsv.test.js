const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.ext - CSV conversions', () => {
  let fragmentId;
  const csvData = 'name,age\nAlice,30\nBob,25';
  const user = { email: 'user1@email.com', password: 'password1' };

  beforeAll(async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user.email, user.password)
      .set('Content-Type', 'text/csv')
      .send(csvData);

    fragmentId = postRes.body.fragment.id;
  });

  test('Convert CSV to .csv', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.csv`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/csv');
    expect(res.text.trim()).toBe(csvData.trim());
  });

  test('Convert CSV to .txt', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toContain('Alice');
    expect(res.text).toContain('Bob');
  });

  test('Convert CSV to .json', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.json`)
      .auth(user.email, user.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/json');
    expect(JSON.parse(res.text)).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' }
    ]);
  });
});
