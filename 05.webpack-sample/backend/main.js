const express = require('express');
const index = require('./index');
const page = require('./page');

const app = express();
app.get('/', index);
app.get('/page', page);

console.log("Listening on port 4000...");
app.listen(4000);
