const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');

require('dotenv').config();

const PORT = 3000;

const app = express();

const config = {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
};

app.use(helmet());

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
  }

passport.use(new Strategy(config, verifyCallback));

function checkedLoggedIn(req, res, next) {
    const loggedIn = true;
    if (!loggedIn) {
        return res.status(401).json({
            err: 'You must log in'
        })
    }
    next();
}

// authenticate 
app.get('/auth/google',
  passport.authenticate('google', { scope: ['email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/failure',
    successRedirect:  '/',
    session: false
  }),
  function(req, res) {
    console.log('Google callback result!!!');
  }
);

app.get('/auth/logout', (req, res) => {});

app.get('/failure', (req, res) => {
    res.send('Failed to authenticate');
})

// secret
app.get('/secret', checkedLoggedIn, (req, res) => {
    res.send('Your personal secret key is 42');
});

// main
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pm'),
    cert: fs.readFileSync('cert.pem')
}, app, ).listen(PORT, () => {
    console.log(`Listening to the ${PORT}...`);
});



