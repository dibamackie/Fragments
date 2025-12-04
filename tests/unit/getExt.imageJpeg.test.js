const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs');
const path = require('path');

describe('GET /v1/fragments/:id.ext - JPEG image conversions', () => {
  let fragmentId;
  const user = { email: 'user1@email.com', password: 'password1' };
  const imagePath = path.join(__dirname, '../images/test.jpg'); // Ensure this image exists

  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(user.email, user.password)
      .set('Content-Type', 'image/jpeg')
      .send(fs.readFileSync(imagePath));

    fragmentId = res.body.fragment.id;
  });

  const conversions = [
    { ext: 'png', contentType: 'image/png' },
    { ext: 'jpg', contentType: 'image/jpeg' },
    { ext: 'webp', contentType: 'image/webp' },
    { ext: 'gif', contentType: 'image/gif' },
    { ext: 'avif', contentType: 'image/avif' },
  ];

  conversions.forEach(({ ext, contentType }) => {
    test(`Convert JPEG to .${ext}`, async () => {
      const res = await request(app)
        .get(`/v1/fragments/${fragmentId}.${ext}`)
        .auth(user.email, user.password);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe(contentType);
      expect(res.body).toBeInstanceOf(Buffer);
    });
  });
});
