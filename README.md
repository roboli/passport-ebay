# passport-ebay

This module still in beta due a [depency](https://github.com/mdemoret/passport-oauth2) which make this stategy possible but its PR has not been merged, but please feel free to start using it (or testing it).

## Install

    $ npm install passport-ebay@beta

## Usage

#### Configure Strategy

Unfortunately eBay doesn't return a profile object, so you must take care of this yourself.

```js
passport.use(new eBayStrategy({
    clientID: EBAY_APP_ID,
    clientSecret: EBAY_APP_SECRET,
    ruName: EBAY_APP_REDIRECT_URL_NAME
  },
  function(accessToken, refreshToken, cb) {
    // Do whatever you need with credentials. A request call to eBay api to fetch user perhaps?
    cb();
  }
));
```

#### Authenticate Requests

```js
app.get('/auth/ebay',
  passport.authenticate('ebay'));

app.get('/auth/ebay/callback',
  passport.authenticate('ebay', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Contributing

#### Tests

```bash
$ npm test
```

## License

[The MIT License](http://opensource.org/licenses/MIT)
