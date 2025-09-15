const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('./logger');

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  tokenUse: 'id',
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
});

logger.info('Configured to use AWS Cognito for Authorization');

jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS successfully cached');
  })
  .catch((err) => {
    logger.error('Unable to cache Cognito JWKS', { err });
  });

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      const payload = await jwtVerifier.verify(token);
      done(null, payload);
    } catch (err) {
      logger.error('Token verification failed', { err });
      done(null, false);
    }
  });

module.exports.authenticate = () => passport.authenticate('bearer', { session: false });