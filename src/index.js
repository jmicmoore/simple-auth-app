const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const auth = require('./middleware/authMiddleware');
const resourceController = require('./controllers/resourceController');
const config = require('./config');

const publicApp = express();
const app = express();

const privateKey  = fs.readFileSync('src/sslcert/localhost-privatekey.pem', 'utf8');
const certificate = fs.readFileSync('src/sslcert/localhost-cert.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const sessionConfig = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
};

function errorHandler (err, req, res, next) {
    console.error(err);
    if (!res.headersSent) {
        res.status(500).send('Unexpected error - see logs for details.');
    }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session(sessionConfig));

app.get('/home', (req, res) => res.send('Hello World!  We are home.'));

app.get('/resource',
    auth.checkUser,
    resourceController.getResource
);

app.get('/oauth2/callback',
    auth.validateReturningState,
    auth.getToken
);
app.post('/oauth2/callback',
    auth.validateReturningState,
    auth.getToken
);

app.get('/oauth2/unsolicitedCallback',
    auth.getToken
);

app.get('/oauth2/logout',
    auth.logout
);

// must go last!
app.use(errorHandler);

console.log(`Configuration:  ${JSON.stringify(config)}`)

var httpServer = http.createServer(publicApp);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(config.port, () => console.log(`Example app listening on port ${config.port}!`));
httpsServer.listen(config.securePort, () => console.log(`Example app listening on secure port ${config.securePort}!`));
