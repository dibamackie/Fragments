const app = require('./app');

const port = parseInt(process.env.PORT || 8080, 10);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});