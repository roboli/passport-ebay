import chai from 'chai';
import chaiStrategy from 'chai-passport-strategy';
import OAuth2Strategy from 'passport-oauth2';
import eBayStrategy from '../src';

chai.use(chaiStrategy);
const expect = chai.expect;

describe('Strategy', () => {
  describe('#constructor', () => {
    it('should be instance of OAuth2Strategy', () => {
      const strategy = new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        ruName: 'ruName'
      }, () => {});
      expect(strategy).to.be.an.instanceof(OAuth2Strategy);
      expect(strategy.name).to.equal('ebay');
    });

    it('should have optional authorizationURL', () => {
      const strategy = new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        ruName: 'ruName',
        authorizationURL: 'authorizationURL'
      }, () => {});
      expect(strategy._oauth2._authorizeUrl).to.equal('authorizationURL');
    });

    it('should throw error with missing clientID', () => {
      const badStrategy = () => new eBayStrategy({
        clientSecret: 'clientSecret',
        ruName: 'ruName'
      }, () => {});
      expect(badStrategy).to.throw(TypeError);
    });

    it('should throw error with missing clientSecret', () => {
      const badStrategy = () => new eBayStrategy({
        clientID: 'clientID',
        ruName: 'ruName'
      }, () => {});
      expect(badStrategy).to.throw(TypeError);
    });

    it('should throw error with missing ruName', () => {
      const badStrategy = () => new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret'
      }, () => {});
      expect(badStrategy).to.throw(TypeError);
    });
  });

  describe('#authenticate', () => {
    describe('authorization request with strategy with params', () => {
      const strategy = new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        ruName: 'ruName',
        scope: ['scope_1', 'scope_2']
      }, () => {});

      let url;

      before(done => {
        chai.passport.use(strategy)
          .redirect(u => {
            url = u;
            done();
          })
          .req(req => {
            req.session = {};
          })
          .authenticate();
      });

      it('should be redirected with params', () => {
        expect(url).to.equal('https://signin.ebay.com/authorize?response_type=code&redirect_uri=ruName&scope=scope_1%20scope_2&client_id=clientID');
      });
    });

    describe('authorization request with strategy without params', () => {
      const strategy = new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        ruName: 'ruName'
      }, () => {});

      let url;

      before(done => {
        chai.passport.use(strategy)
          .redirect(u => {
            url = u;
            done();
          })
          .authenticate({
            state: 'any_state',
            scope: ['scope_1', 'scope_2']
          });
      });

      it('should be redirected with params', () => {
        expect(url).to.equal('https://signin.ebay.com/authorize?response_type=code&redirect_uri=ruName&scope=scope_1%20scope_2&state=any_state&client_id=clientID');
      });
    });

    describe('authorization request with strategy without params', () => {
      const strategy = new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        ruName: 'ruName'
      }, () => {});

      let url;

      before(done => {
        chai.passport.use(strategy)
          .redirect(u => {
            url = u;
            done();
          })
          .authenticate();
      });

      it('should be redirected without params', () => {
        expect(url).to.equal('https://signin.ebay.com/authorize?response_type=code&redirect_uri=ruName&client_id=clientID');
      });
    });

    describe('failure caused by user denying request', () => {
      const strategy = new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        ruName: 'ruName'
      }, () => {});

      let info;

      before(done => {
        chai.passport.use(strategy)
          .fail(i => {
            info = i;
            done();
          })
          .req(req => {
            req.query = {};
            req.query.error = 'access_denied';
            req.query.error_code = '200';
            req.query.error_description  = 'Permissions error';
            req.query.error_reason = 'user_denied';
          })
          .authenticate();
      });

      it('should fail with info', () => {
        expect(info).to.not.be.undefined;
        expect(info.message).to.equal('Permissions error');
      });
    });

    describe('error caused by unknown reason', () => {
      const strategy = new eBayStrategy({
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        ruName: 'ruName'
      }, () => {});

      let err;

      before(done => {
        chai.passport.use(strategy)
          .error(e => {
            err = e;
            done();
          })
          .req(req => {
            req.query = {};
            req.query.error = 'error';
            req.query.error_uri = 'an uri';
            req.query.error_description = 'an error description';
          })
          .authenticate();
      });

      it('should error', function() {
        expect(err.constructor.name).to.equal('AuthorizationError');
        expect(err.message).to.equal('an error description');
        expect(err.code).to.equal('error');
      });
    });

    describe('error caused by invalid code sent to token endpoint', () => {
      const strategy = new eBayStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        ruName: 'ruName'
      }, () => {});
      
      strategy._oauth2.getOAuthAccessToken = (code, options, callback) => {
        return callback({ statusCode: 400, data: '{"error": "invalid_request", "error_description": "request is missing a required parameter or malformed."}' });
      };
      
      let err;

      before(done => {
        chai.passport.use(strategy)
          .error(e => {
            err = e;
            done();
          })
          .req(req => {
            req.query = {};
            req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1';
          })
          .authenticate();
      });

      it('should error', function() {
        expect(err.constructor.name).to.equal('TokenError');
        expect(err.message).to.equal('request is missing a required parameter or malformed.');
        expect(err.code).to.equal('invalid_request');
      });
    }); // error caused by invalid code sent to token endpoint
  });
});
