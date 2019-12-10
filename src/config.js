
const APP_DEFAULT_CLIENT_ID = '[paste auth0 client id here]';
const APP_DEFAULT_SECRET = '[paste auth0 secret here]';
const AUTH0_POC_DOMAIN = 'rga-sp-poc.auth0.com';
const AUTH0_DEV_DOMAIN = 'rga-aura-dev.auth0.com';
const OAUTH_IDP_CONN = 'SecureAuth4';
const SAML_IDP_CONN = 'NYL-SAML-IdP';
const DEFAULT_REDIRECT_URI = 'https://localhost:3001/oauth2/callback';

const env = process.env;

module.exports = {
    appClientId: env.APP_CLIENT_ID || APP_DEFAULT_CLIENT_ID,
    appSecret: env.APP_SECRET || APP_DEFAULT_SECRET,
    authDomain: env.AUTH_DOMAIN || AUTH0_POC_DOMAIN,
    authIdpConn: env.AUTH_IDP_CONN || OAUTH_IDP_CONN,
    redirectUri: env.REDIRECT_URI || DEFAULT_REDIRECT_URI
}
