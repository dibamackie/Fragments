const request = require('supertest');
const app = require('../../src/app'); // Import your Express app
const { Fragment } = require('../../src/model/fragment');
const markdownIt = require('markdown-it');

jest.mock('../../src/model/fragment'); // Mock Fragment model

describe('GET /v1/fragments/:id with format conversion', () => {
  const userId = 'user1@email.com';
  const fragmentId = 'test-fragment';
  const markdownData = '# Hello World\nThis is a markdown file.';
  const plainTextData = 'Hello World\nThis is a markdown file.';
  const mockFragment = {
    id: fragmentId,
    type: 'text/markdown',
    size: markdownData.length,
    isText: true,
    getData: jest.fn().mockResolvedValue(Buffer.from(markdownData)),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Fragment.byId.mockResolvedValue(mockFragment);
  });

  test('should convert Markdown (.md) to HTML (.html)', async () => {
    const md = markdownIt();
    const expectedHtml = md.render(markdownData); // Expected HTML output

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(userId, 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text.trim()).toBe(expectedHtml.trim()); // Verify conversion
  });

  test('should return Markdown as plain text when requesting .txt', async () => {
    const res = await request(app).get(`/v1/fragments/${fragmentId}.txt`).auth(userId, 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.text.trim()).toBe(markdownData.trim());
  });
  test('should return raw Markdown when requesting .md', async () => {
    const res = await request(app).get(`/v1/fragments/${fragmentId}.md`).auth(userId, 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/markdown; charset=utf-8');
    expect(res.text.trim()).toBe(markdownData.trim());
  });

  test('should convert Text (.txt) to HTML (.html)', async () => {
    const md = markdownIt();
    const expectedHtml = md.render(plainTextData); // Expected HTML output
    console.log(expectedHtml);

    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(userId, 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
  });
});
