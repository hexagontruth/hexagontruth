const pth = require('path');

const express = require('express');

const app = express();

const isProduction = process.env.NODE_ENV == 'production';
const port = process.env.PORT || isProduction && 8080 || 8081;

// Parse requests of content-type: application/json
app.use(express.json());

// Parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Static
if (isProduction){
  app.use(express.static('public'));
}
else {
  app.use(express.static('media'));
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}. Hooray!`);
});
