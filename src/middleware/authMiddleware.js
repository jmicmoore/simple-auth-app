const agent = require('superagent');
const {appClientId, appSecret, authDomain, authIdpConn, redirectUri} = require('../config');

module.exports.checkUser = (req, res, next) => {
    console.log('Checking user....');
    if(!req.session.token){
        console.log('Saving host and URL user...');
        const state = {
            'xyz123': {
                originalUrl: req.originalUrl
            }
        };
        req.session.state = state;
        const encodedState = encodeURIComponent(JSON.stringify(state));
        authenticate(encodedState, res);
    } else {
        next();
    }
};

const authenticate = (encodedState, res) => {
    console.log('Authenticating user...');

    res.redirect(307,
        `https://${authDomain}/authorize?response_type=code&scope=openid&client_id=${appClientId}&connection=${authIdpConn}&redirect_uri=${redirectUri}&state=${encodedState}`);
};

module.exports.getToken = (req, res) => {
    const returningState = JSON.parse(req.query.state);
    const savedState = req.session.state;
    if(savedState && getKey(returningState) != getKey(savedState)){
        console.log(`returning state '${req.query.state}' does not match initial state '${req.session.state}'`);
        res.status(401).send('Unauthorized');
        return;
    }
    console.log('Getting token...');

    agent
        .post(`https://${authDomain}/oauth/token`)
        .send({
            grant_type: 'authorization_code',
            client_id: appClientId,
            client_secret: appSecret,
            code: req.query.code,
            redirect_uri: redirectUri // must match the original redirect_uri from the /authorize call
        })
        .then( tokenResponse => {
            console.log('/token response:  ' + JSON.stringify(tokenResponse.body));
            req.session.token = tokenResponse.body.id_token;

            if(req.session.token){
                const stateKey = getKey(returningState);
                const finalDestination = returningState[stateKey].originalUrl;
                console.log(`Received id_token - redirecting to ${finalDestination}`);
                res.redirect(finalDestination);
            } else {
                console.log('Response is missing id_token!');
                res.status(401).send('Unauthorized');
            }
        })
        .catch( err => {
            console.error('error: ', err);
            res.status(401).send('Unauthorized');
        });
};

const getKey = (state) => {
    const keys = Object.keys(state);
    return keys.length === 1 ? keys[0] : '';
};
