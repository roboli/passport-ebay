import OAuth2Strategy from 'passport-oauth2';

export default class eBayStrategy extends OAuth2Strategy {
  constructor(options = {}, verify = null) {
    if(!options.clientSecret) {
      throw new TypeError('Strategy requires a clientSecret option');
    }

    if(!options.ruName) {
      throw new TypeError('Strategy requires a ruName option');
    }

    options.authorizationURL = options.authorizationURL || 'https://signin.ebay.com/authorize';
    options.tokenURL = options.tokenURL || 'https://api.ebay.com/identity/v1/oauth2/token';

    options.customHeaders = options.customHeaders || {};
    options.customHeaders.Authorization = 'Basic ' + new Buffer(options.clientID + ':' + options.clientSecret).toString('base64');

    options.callbackURL = options.ruName;
    options.useExactURLs = true;
    options.skipUserProfile = true;

    let cb;

    if(verify) {
      if(options.passReqToCallback) {
        cb = (req, accessToken, refreshToken, noProfile, done) => verify(req, accessToken, refreshToken, done);
      } else {
        cb = (accessToken, refreshToken, noProfile, done) => verify(accessToken, refreshToken, done);
      }
    }

    super(options, cb);

    this.name = 'ebay';
  }
}
