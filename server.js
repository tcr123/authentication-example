const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');

require('dotenv').config();

const PORT = 3000;

const app = express();

const config = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
};

app.use(helmet());

function checkedLoggedIn(req, res, next) {
    const loggedIn = true;
    if (!loggedIn) {
        return res.status(401).json({
            err: 'You must log in'
        })
    }
    next();
}

app.get('/auth/google', checkedLoggedIn, () => {});
app.get('/auth/google/callback', () => {});
app.get('/auth/logout', () => {});

app.get('/secret', (req, res) => {
    res.send('Your personal secret key is 42');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pm'),
    cert: fs.readFileSync('cert.pem')
}, app, ).listen(PORT, () => {
    console.log(`Listening to the ${PORT}...`);
});



