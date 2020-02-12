const agent = require('superagent');
const {appClientId, appSecret, authDomain, authIdpConn, redirectUri, authFlow} = require('../config');

module.exports.checkUser = (req, res, next) => {
    console.log('Checking for token....');
    if(!req.session.token){
        console.log('No token');
        const state = {
            'xyz123': {
                originalUrl: req.originalUrl
            }
        };
        console.log(`Saving state in session: ${JSON.stringify(state)}`);
        req.session.state = state;

        authenticate(res, state);
    } else {
        console.log('Token found!');
        next();
    }
};

module.exports.validateReturningState = (req, res, next) => {
    const returningState = JSON.parse(req.query.state || req.body.state);
    const savedState = req.session.state;
    if(savedState && getKey(returningState) != getKey(savedState)){
        console.error(`returning state '${req.query.state}' does not match initial state '${req.session.state}'`);
        res.status(401).send('Unauthorized');
    } else {
        next();
    }
}

module.exports.getToken = (req, res, next) => {
    const state = req.session.state;

    if(authFlow === 'implicit'){
        console.log('received id_token:  ' + JSON.stringify(req.body.id_token));
        saveTokenAndRedirect(req, res, req.body.id_token, state);
    } else { // auth code flow
        const tokenUrl = `https://${authDomain}/oauth/token`;
        console.log(`Auth code flow - getting token from '${tokenUrl}'`);
        agent
            .post(tokenUrl)
            .send({
                grant_type: 'authorization_code',
                client_id: appClientId,
                client_secret: appSecret,
                code: req.query.code,
                redirect_uri: redirectUri // must match the original redirect_uri from the /authorize call
            })
            .then( tokenResponse => {
                console.log('Received id_token:  ' + JSON.stringify(tokenResponse.body.id_token));
                saveTokenAndRedirect(req, res, tokenResponse.body.id_token, state);
            })
            .catch( err => {
                res.status(401).send('Unauthorized');
                next(err);
            });
    }
};

const encode = (value) => encodeURIComponent(JSON.stringify(value));

const authenticate = (res, state) => {
    const responseType = 'response_type=' + (authFlow === 'code' ? 'code' : 'token id_token');
    const responseMode = authFlow === 'implicit' ? '&response_mode=form_post' : '';
    const encodedNonce = authFlow === 'implicit' ? '&nonce=' + encode('abc123') : '';
    const encodedState = encode(state);

    const authUrl = `https://${authDomain}/authorize?${responseType}${responseMode}&scope=openid profile email&client_id=${appClientId}&connection=${authIdpConn}&redirect_uri=${redirectUri}&state=${encodedState}${encodedNonce}`;
    console.log(`Authenticating user:  ${authUrl}`);
    res.redirect(307, authUrl);
};

const saveTokenAndRedirect = (req, res, token, state) => {
    if(token){
        req.session.token = token;
        const stateKey = getKey(state);
        const finalDestination = state[stateKey].originalUrl;
        console.log(`Received id_token - redirecting to ${finalDestination}`);
        res.redirect(finalDestination);
    } else {
        console.error('Missing id_token!');
        res.status(401).send('Unauthorized');
    }
};

const getKey = (state) => {
    const keys = Object.keys(state);
    return keys.length === 1 ? keys[0] : '';
};
