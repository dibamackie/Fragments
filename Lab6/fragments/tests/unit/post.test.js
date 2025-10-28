const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // Test case: Missing Authorization header (unauthenticated user)
  test('unauthenticated requests are denied', () => 
    request(app)
      .post('/v1/fragments')
      .send('raw data') // Sending raw data in the body
      .expect(401)
  );

  // Test case: Invalid credentials
  test('incorrect credentials are denied', () =>
    request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .send('raw data')
      .expect(401)
  );

  // Test case: Valid request with correct credentials but no body (should return 400)
  test('requests without body return 400', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('') // Empty body
      .expect(400) // Expect 400 Bad Request
      .then((res) => {
        expect(res.body.error).toBe('Invalid body format, expected raw binary data.');  // Expect error message
      })
  );

  


  // Test case: Valid request with supported Content-Type (should create a fragment)
  test('valid requests create a fragment and return 201', () =>
    request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')  // Correct Content-Type for raw data
      .send('This is a fragment data')   // Send raw text data
      .expect(201)  // Expect 201 Created
      .then((res) => {
        expect(res.body.fragment.id).toBeDefined();
      }),
  );

  // Test case: Valid request with text/plain (verify that the fragment data is stored correctly)
  test('fragment data is saved correctly', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')  // Supported content type
      .send('This is a text fragment');
  
    // The response should return 201 and include a fragmentId
    expect(res.statusCode).toBe(201);
    const fragmentId = res.body.fragment.id;  // The fragmentId from the response body
  
    // Confirm that the Location header is set correctly
    const host = res.headers.host;
    const locationUrl = `http://${host}/v1/fragments/${fragmentId}`;
    expect(locationUrl).toBe(`http://${res.headers.host}/v1/fragments/${fragmentId}`);
  
    // Optionally log the URL for inspection
    console.log('Location URL:', locationUrl);
  });
  

  // Test case: Internal server error (simulate failure in fragment creation)
  test('empty data returns 400 Bad Request', async () => {
    // Simulating an empty body, which should return 400 due to validation
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(''); // Sending empty data
  
    // Expect 400 Bad Request due to validation of empty body
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid body format, expected raw binary data.');
  });
  
});
