const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const auth = require('./middleware/authMiddleware');
const resourceController = require('./controllers/resourceController');

const publicApp = express();
const app = express();

const port = 3000;
const securePort = 3001;

const privateKey  = fs.readFileSync('src/sslcert/localhost-privatekey.pem', 'utf8');
const certificate = fs.readFileSync('src/sslcert/localhost-cert.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const sessionConfig = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
};

app.use(bodyParser.json());
app.use(cors());
app.use(session(sessionConfig));

publicApp.get('/', (req, res) => res.send('Hello World!'));
app.get('/', (req, res) => res.send('Hello World Secure!'));

app.get('/resource',
    auth.checkUser,
    resourceController.getResource
);

app.get('/oauth2/callback',
    auth.getToken
);
app.post('/oauth2/callback',
    auth.getToken
);

var httpServer = http.createServer(publicApp);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(port, () => console.log(`Example app listening on port ${port}!`));
httpsServer.listen(securePort, () => console.log(`Example app listening on port ${securePort}!`));
