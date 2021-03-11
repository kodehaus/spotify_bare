const express = require('express')
const port = 8888;
const mainRoutes = require('./routes/main.route');
const bodyParser = require('body-parser');
var SpotifyWebApi = require('spotify-web-api-node');
var { config } = require('./config');

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
// route to use for the api

var spotifyApi = new SpotifyWebApi();
const scopes = [
    'playlist-read-collaborative',
    'playlist-read-private',
    'user-library-read',
    'user-top-read',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
  redirectUri: config.spotify.redirectUri
});

app.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});
  
  
  app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
  
    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
  
        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);
  
        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        res.redirect('/search');
  
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
  
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
      })
      .catch(err => {
        console.error('Error getting Tokens:', err);
        res.send(`Error getting Tokens: ${err}`);
      });
  });

app.get('/search', async (req, res) => {
    // Search tracks whose name, album or artist contains 'Love'
    let respItems;
//    q=bob%20year:2014
    await spotifyApi.searchTracks('artist:Love').then(
        function(data) {
          console.log(data.body);
        },
        function(err) {
          console.log('Something went wrong!', err);
        }
      );
    
    res.send(JSON.stringify(respItems));
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })