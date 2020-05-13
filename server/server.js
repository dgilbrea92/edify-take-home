const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const PORT = 3000;

app.use(express.json());

app.use(express.static('public'));

app.get('/api/parks/favorites', (req, res, next) => {
  fs.readFile(path.join(__dirname, 'cache.json'), 'utf8', (err, cache) => {
    if (err) {
      throw err;
    } else {
      const favorites = {};
      const parsedCache = JSON.parse(cache);
      for (let state in parsedCache) {
        for (let park in parsedCache[state]) {
          if (parsedCache[state][park].favorite == true) {
            favorites[parsedCache[state][park].fullName] = {
              fullName: parsedCache[state][park].fullName,
              favorite: true,
              city: parsedCache[state][park].city,
              stateCode: parsedCache[state][park].stateCode,
              entranceFee: parsedCache[state][park].entranceFee,
              parkPhone: parsedCache[state][park].parkPhone,
              parkEmail: parsedCache[state][park].parkEmail,
              activities: parsedCache[state][park].activities,
              imageUrl: parsedCache[state][park].imageUrl
            }
          }
        }
      }
      res.status(200).send(favorites);
    }
  })
})

app.patch('/api/parks/favorites', (req, res, next) => {
  // find req.body.fullName in cache and set favorite to true
  fs.readFile(path.join(__dirname, 'cache.json'), 'utf8', (err, data) => {
    if (err) {
      throw err;
    } else {
      const parksCache = JSON.parse(data);
      parksCache[req.body.stateCode][req.body.fullName].favorite = req.body.favorite;

      fs.writeFile(path.join(__dirname, 'cache.json'), JSON.stringify(parksCache), err => {
        if (err) {
          next(err);
        } else {
          res.status(200).send('Successfully updated favorites.');
        }
      });
    }
  })
})

app.get('/api/parks/:state', (req, res, next) => {
  // check cache for the requested state and return from there if it exists
  fs.readFile(path.join(__dirname, 'cache.json'), 'utf8', (err, data) => {
    if (err) {
      throw err;
    } else {
      const parksCache = JSON.parse(data);

      if (parksCache[req.params.state]) {
        res.status(200).send(parksCache[req.params.state]);
      } else {
        // else fetch new data from parks API
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
                  fullName: park.fullName,
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
            res.locals = parksCache[req.params.state];
            fs.writeFile(path.join(__dirname, 'cache.json'), JSON.stringify(parksCache), err => {
              if (err) {
                next(err);
              } else {
                console.log('Successfully cached data.');
              }
            });

            res.status(200).send(res.locals);
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