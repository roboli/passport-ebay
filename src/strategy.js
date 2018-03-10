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

    super(options, verify);

    this.name = 'ebay';
  }
}
