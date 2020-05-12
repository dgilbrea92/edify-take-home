const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const PORT = 3000;

app.use(express.json());

app.use(express.static('public'));

app.post('/api/parks/favorite/', (req, res, next) => {
  res.status(200).send('OK');
})

app.get('/api/parks/:state', (req, res, next) => {
  // check cache for the requested state and return from there if it exists
  fs.readFile(path.join(__dirname, 'cache.json'), 'utf8', (err, data) => {
    if (err) {
      throw err;
    } else {

      const parksCache = JSON.parse(data);

      if (parksCache[req.params.state]) {
        console.log('Found in cache!');
        res.status(200).send(parksCache[req.params.state]);
      } else {
        // else fetch new data from parks API
        console.log('Not found');
        const url = `https://developer.nps.gov/api/v1/parks?stateCode=${req.params.state}&api_key=j1WghsFUUeH4fyCRBXxdB2wLbKpIqoWhmLOI2onV`;

        const getData = async url => {
          try {
            const response = await fetch(url);
            const json = await response.json();
            // build cache data object with query string as the key
            const data = {};
            // add each park as a nested object on the query key with favorite status = false, name, location, entrance fee, phone, email, activities
            for (let park of json.data) {
              if (park.fullName && park.images[0].url && park.entranceFees[0]) {
                data[park.fullName] = {
                  favorite: false,
                  city: park.addresses[0].city,
                  stateCode: park.addresses[0].stateCode,
                  entranceFee: park.entranceFees[0].cost,
                  parkPhone: park.contacts.phoneNumbers[0].phoneNumber,
                  parkEmail: park.contacts.emailAddresses[0].emailAddress,
                  activities: park.activities,
                  imageUrl: park.images[0].url
                }
              }
            }
            // write data to cache
            parksCache[req.params.state] = data;
            fs.writeFile(path.join(__dirname, 'cache.json'), JSON.stringify(parksCache), err => {
              if (err) {
                next(err);
              } else {
                console.log('Successfully cached data.');
              }
            });

            res.status(200).send(json);
          } catch (error) {
            next(error);
          }
        };

        getData(url);
      }
    }
  })


})

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).send('Something bad happened...' + err);
  }
})

app.listen(PORT, () => console.log('Park Finder is listening on port ' + PORT));