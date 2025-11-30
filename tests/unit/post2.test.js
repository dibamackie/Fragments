const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {

  // Test case: Supported Content-Type - text/plain (Valid)
  test('text/plain content type creates a fragment and returns 201', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')  // Supported Content-Type
      .send('This is a text fragment')
      .expect(201)  // Expect 201 Created
      .then((res) => {
        expect(res.body.fragment.id).toBeDefined();
      })
  );

  // Test case: Supported Content-Type - application/json (Valid)
  test('application/json content type creates a fragment and returns 201', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')  // Supported Content-Type
      .send(JSON.stringify({ key: 'value' }))
      .expect(201)  // Expect 201 Created
      .then((res) => {
        expect(res.body.fragment.id).toBeDefined();
      })
  );

  test('image/jpeg uploads are accepted', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(Buffer.from([0xff, 0xd8, 0xff])) // minimal JPEG header
  
    expect(res.statusCode).toBe(201);
    expect(res.body.fragment.type).toBe('image/jpeg');
  });

  // Test case: Invalid body format, expected raw binary data. - application/xml (Invalid)
  test('application/xml content type returns 415', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/xml')  // Invalid body format, expected raw binary data.
      .send('<root><data>This is XML</data></root>')
      .expect(400)  // Expect 400 Invalid body format, expected raw binary data.
      .then((res) => {
        expect(res.body.error).toBe('Invalid body format, expected raw binary data.');
      })
  );

  // Test case: Missing Content-Type header (Invalid)
  test('requests without Content-Type header return 400', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('This is a fragment without Content-Type header')
      .expect(400)  // Expect 400 Bad Request
      .then((res) => {
        expect(res.body.error).toBe('Invalid body format, expected raw binary data.');
      })
  );

  // Test case: Invalid Content-Type header (non-text type, e.g., multipart/form-data)
  test('multipart/form-data content type returns 400', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'multipart/form-data')  // Unsupported Content-Type
      .send('This should fail due to unsupported multipart/form-data')
      .expect(400)  // Expect 400 Invalid body format, expected raw binary data.
      .then((res) => {
        expect(res.body.error).toBe('Invalid body format, expected raw binary data.');
      })
  );

  // Test case: Correct Content-Type (text/html) should be accepted
  test('text/html content type returns 201', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')  // Supported Content-Type
      .send('<html><body>This is an HTML fragment</body></html>')  // Send HTML data
      .expect(201)  // Expect 201 Created
      .then((res) => {
        expect(res.body.fragment.id).toBeDefined();  // Check that the fragment ID is returned
      })
  );

  // Test case: Large valid data with text/plain (Valid)
  test('large text/plain fragment should return 201', async () => {
    const largeData = 'A'.repeat(1024 * 1024 * 5);  // 5MB of "A" characters
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(largeData);

    expect(res.statusCode).toBe(201);  // Expect 201 Created
    expect(res.body.fragment.id).toBeDefined();
  });

  // Test case: Empty body with valid Content-Type (Invalid)
  test('empty body with valid Content-Type returns 400', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')  // Supported Content-Type
      .send('')  // Empty body
      .expect(400)  // Expect 400 Bad Request due to empty body
      .then((res) => {
        expect(res.body.error).toBe('Invalid body format, expected raw binary data.');
      })
  );

});
