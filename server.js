const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');

require('dotenv').config();

const PORT = 3000;

const config = {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
  }

passport.use(new Strategy(config, verifyCallback));

// save session to cookie
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// load session from cookie
passport.deserializeUser(function(id, done) {
    done(null, id)
});

const app = express();

app.use(helmet());

app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.SECRET_KEY1, process.env.SECRET_KEY2]
}));
app.use(passport.initialize());
app.use(passport.session());

function checkedLoggedIn(req, res, next) {
    console.log('Current user is:', req.user);
    const loggedIn = req.isAuthenticated() && req.user;
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
    session: true
  }),
  function(req, res) {
    console.log('Google callback result!!!');
  }
);

app.get('/auth/logout', (req, res) => {
    req.logOut();
    return res.redirect('/');
});

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



