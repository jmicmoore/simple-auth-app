const DEFAULT_APP_CLIENT_ID = '[paste auth0 client id here]';
const DEFAULT_APP_SECRET = '[paste auth0 secret here]';
const DEFAULT_AUTH_DOMAIN = 'rga-aura-dev.auth0.com';
const DEFAULT_AUTH_FLOW = 'code' // valid values are 'code' and 'implicit'
const DEFAULT_PORT = 3000;
const DEFAULT_SECURE_PORT = 3001;
const DEFAULT_REDIRECT_URI = 'https://localhost:' + DEFAULT_SECURE_PORT + '/oauth2/callback';

const env = process.env;

module.exports = {
    appClientId: env.APP_CLIENT_ID || DEFAULT_APP_CLIENT_ID,
    appSecret: env.APP_SECRET || DEFAULT_APP_SECRET,
    authDomain: env.AUTH_DOMAIN || DEFAULT_AUTH_DOMAIN,
    authFlow: env.AUTH_FLOW === 'implicit' ? 'implicit' : DEFAULT_AUTH_FLOW,
    port: env.PORT || DEFAULT_PORT,
    securePort: env.SECURE_PORT || DEFAULT_SECURE_PORT,
    redirectUri: env.REDIRECT_URI || DEFAULT_REDIRECT_URI
}
