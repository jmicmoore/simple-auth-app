const agent = require('superagent');
const crypto = require('crypto');
const {appClientId, appSecret, authDomain, redirectUri, authFlow} = require('../config');

module.exports.checkUser = (req, res, next) => {
    console.log('Checking for token....');
    if(!req.session.token){
        console.log('No token');
        let nonce = crypto.randomBytes(16).toString('base64');
        const state = {
            [nonce] : {
                originalUrl: req.originalUrl
            }
        };
        console.log(`Saving state in session: ${JSON.stringify(state)}`);
        req.session.state = state;

        authenticate(req, res, state);
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
};

// Important things to keep in mind:
//
// For using Auth0 for OIDC / auth code flow,
// the redirect_uri in the /token call must match the original redirect_uri from the /authorize call
// - ONLY IF it was supplied in the original /authorize call
// - Otherwise the redirect_uri is not needed in the /token call
//
//
// For using Auth0 for SAML / IDP-Driven flow,
// In the connection > IDP-Initiated SSO > Query String you can specify the redirect_uri.
// This redirect_uri from Query String is passed along to the /authorize call as an argument.
// This must still match the redirect_uri from the /token call
module.exports.getToken = (req, res, next) => {
    if(req.query.error){
        console.log('Error:  ', req.query.error_description, ", State:  ", JSON.stringify(req.query.state));
        res.status(401).send('Unauthorized');
        return;
    }

    const state = req.session.state || (req.query.state && JSON.parse(req.query.state));
    if(!state){
        console.log('Missing state!');
        res.status(401).send('Unauthorized');
        return;
    }

    if(authFlow === 'implicit'){
        if(!req.body.id_token){
            console.log('Missing id_token!');
            res.status(401).send('Unauthorized');
            return;
        }
        saveTokenAndRedirect(req, res, req.body.id_token, state);
    } else { // auth code flow
        if(!req.query.code){
            console.log('Missing code!');
            res.status(401).send('Unauthorized');
            return;
        }
        const tokenUrl = `https://${authDomain}/oauth/token`;
        console.log(`Auth code flow - getting token from '${tokenUrl}'`);
        agent
            .post(tokenUrl)
            .send({
                grant_type: 'authorization_code',
                client_id: appClientId,
                client_secret: appSecret,
                code: req.query.code,
                redirect_uri: redirectUri
            })
            .then( tokenResponse => {
                if(!tokenResponse.body.id_token){
                    console.log('Missing id_token!');
                    res.status(401).send('Unauthorized');
                    return;
                }
                saveTokenAndRedirect(req, res, tokenResponse.body.id_token, state);
            })
            .catch( err => {
                console.log('Error: ', err);
                res.status(401).send('Unauthorized');
                next(err);
            });
    }
};

module.exports.logout = (req, res) => {
    console.log('Logout user');
    delete req.session.token;
    delete req.session.state;
    // const logoutUrl = `https://${authDomain}/v2/logout?returnTo=https://localhost:3001/home&client_id=${appClientId}&federated`;
    // also try returnTo=https://jwt.io
    const logoutUrl = `https://${authDomain}/v2/logout?client_id=${appClientId}&returnTo=https://jwt.io&federated`;
    res.redirect(logoutUrl);
}

const encode = (value) => encodeURIComponent(JSON.stringify(value));

const authenticate = (req, res, state) => {
    const responseType = 'response_type=' + (authFlow === 'code' ? 'code' : 'token id_token');
    const responseMode = authFlow === 'implicit' ? '&response_mode=form_post' : '';
    const encodedNonce = authFlow === 'implicit' ? '&nonce=' + encode('abc123') : '';
    const connection = req.query.connection ? '&connection=' + req.query.connection : '';
    const encodedState = encode(state);

    const authUrl = `https://${authDomain}/authorize?${responseType}${responseMode}&scope=openid profile email&client_id=${appClientId}${connection}&redirect_uri=${redirectUri}&state=${encodedState}${encodedNonce}`;
    console.log(`Authenticating user:  ${authUrl}`);
    res.redirect(307, authUrl);
};

const saveTokenAndRedirect = (req, res, token, state) => {
    req.session.token = token;
    const stateKey = getKey(state);
    const finalDestination = state[stateKey].originalUrl;
    console.log('Received id_token:  ' + JSON.stringify(token));
    console.log(`Redirecting to ${finalDestination}`);
    res.redirect(finalDestination);
};

const getKey = (state) => {
    const keys = Object.keys(state);
    return keys.length === 1 ? keys[0] : '';
};
