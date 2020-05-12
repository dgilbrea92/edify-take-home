const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const PORT = 3000;

app.use(express.json());

app.use('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
})

app.listen(PORT, () => console.log('Park Finder is listening on port ' + PORT));