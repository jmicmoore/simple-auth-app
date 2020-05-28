# simple-auth-app
Simple app that helps test out various OIDC / OAuth flows

## To install, clone the project, then

`npm install`

## To configure for auth code flow

- APP_CLIENT_ID=izNRWNGGXyRdaegRMO1gOkSQGWu6xuQx
- APP_SECRET=[shhh!]
- AUTH_DOMAIN=rga-aura-dev.auth0.com

## To configure for implicit flow

- APP_CLIENT_ID=izNRWNGGXyRdaegRMO1gOkSQGWu6xuQx
- APP_SECRET=[shhh!]
- AUTH_DOMAIN=rga-aura-dev.auth0.com
- AUTH_FLOW=implicit

## To configure for SAML/IDP-Driven to OIDC / Unsolicited Callback Flow

- APP_CLIENT_ID=izNRWNGGXyRdaegRMO1gOkSQGWu6xuQx
- APP_SECRET=[shhh!]
- AUTH_DOMAIN=rga-aura-dev.auth0.com
- REDIRECT_URI=https://localhost:3001/oauth2/unsolicitedCallback 

## More config options available in config.js
