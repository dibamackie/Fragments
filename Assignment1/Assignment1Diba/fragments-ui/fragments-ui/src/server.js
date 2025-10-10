const express = require('express');
const path = require('path');
const app = express();
const PORT = 1234;
require('dotenv').config();

// Serve static files from the parent directory of "src"
app.use(express.static(path.join(__dirname, '..')));

// Route to serve the login.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('/config', (req, res) => {
  res.json({
    AWS_COGNITO_POOL_ID: process.env.AWS_COGNITO_POOL_ID,
    AWS_COGNITO_CLIENT_ID: process.env.AWS_COGNITO_CLIENT_ID,
    OAUTH_SIGN_IN_REDIRECT_URL: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
    HTPASSWD_FILE: process.env.HTPASSWD_FILE,
    API_URL: process.env.API_URL,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

