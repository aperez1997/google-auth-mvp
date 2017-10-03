var express = require('express');
var app = express();

var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
    'YOUR CLIENT ID', // client id
    'YOUR SECRET', // client secret
    'http://www.foo.com:3000/callback' // callback that google sends you back to. Must be configured in your google API console
);

app.get('/', function (req, res) {
    
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
      'https://www.googleapis.com/auth/plus.me'
    ];
    
    var url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline'
      // If you only need one scope you can pass it as a string
      , scope: scopes
      // Optional property that passes state parameters to redirect URI
      // state: { foo: 'bar' }
    });
    
    res.send('<h1>Open Source For You!</h1><a href="' + url + '">Google</a>');
});

app.get('/callback', function(req, res){
    var code = req.query.code;
    console.log('google code is ' + code);
    
    oauth2Client.getToken(code, function (err, tokens) {
        if (err){
            res.send(JSON.stringify(err));
        }
        
        // Now tokens contains an access_token and an optional refresh_token.
        // could save tokens to the DB at this point, as part of user object
        oauth2Client.setCredentials(tokens);
        plus.people.get({
            userId: 'me',
            auth: oauth2Client
            }, function (err, response) {
                if (err){
                    res.send('google plus/me error ' + JSON.stringify(err));
                } else {
                    // Do important stuff
                    var id = response.id; // like lookup this ID in your data-store. Create it if it doesn't exist.
                    var displayName = response.displayName; // Maybe you want to save their google name too
                    var url = response.url; // or the URL to their google+ page 
                    res.send('Google+ response ' + JSON.stringify(response));
                }
            }
        );
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});